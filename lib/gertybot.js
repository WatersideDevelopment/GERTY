'use strict';

/**
 * Requirements
 */
var fs = require('fs');
var path = require('path');
var util = require('util');
var bunyan = require('bunyan');
var Bot = require('slackbots');

/**
 * Even our basic commands are handled as Gerty Plugins (Cells)
 */

var CoreCell = require('./cells/core/core.cell');

/**
 * Constructor function. It accepts a settings object which should contain the following keys:
 *      token : the API token of the bot (mandatory)
 *      name : the name of the bot (will default to "gerty")
 *
 * @param {object} settings
 * @constructor
 *
 * @author D. Rimron-Soutter <darran@xalior.com>
 */
var GertyBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'gerty';
    this.settings.cellConfig = this.settings.cellConfig || {};
    this.commands = new Array();
    this.command_detector = new RegExp("^\![a-zA-Z0-9_-]+");

    this.log = bunyan.createLogger({
        name: this.settings.name
    });

    // Register our core functions... This can also be run by wrapper scripts to extend GERTY
    // for deeper integration than just plugins, etc.
    this.register(new CoreCell(this));

    this._loadPlugins();
    this.user = null;
};


// inherits methods and properties from the Bot constructor
util.inherits(GertyBot, Bot);

/**
 * Run the bot
 * @public
 */
GertyBot.prototype.run = function () {
    GertyBot.super_.call(this, this.settings);

    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

/**
 * Used to register new plugins...
 */
GertyBot.prototype.register = function (cell) {
    cell.register();
};

/**
 * Used by the registration of plugins...
 * @private
 */
GertyBot.prototype._register = function (command, plugin) {
    this.log.info('Registering plugin '+plugin.name);
    this.commands[command] = plugin;
};

/**
 * Used to find and load new plugins...
 * @private
 */
GertyBot.prototype._loadPlugins = function () {
    if(this.settings.cellDir) {
        var cellDir = path.resolve(this.settings.cellDir);
        this.log.debug('Checking for cell in '+cellDir+' and immediate children...');
        var cells = fs.readdirSync(cellDir);
        for(var cell in cells) {
            this.log.debug('Checking for cell in '+this.settings.cellDir+'/'+cells[cell]);
            var cellDetails = require(cellDir+'/'+cells[cell]+'/package.json');
            // We should probably inspect package.json to doublecheck that this is really a GertyCell
            this.log.info('Loading External Cell: '+cellDetails.name+' ('+cellDetails.description+')');
            var NewCell = require(cellDir+'/'+cells[cell]+'/' + cellDetails.main);
            var readyCell = new NewCell(this);
            this.log.info('Registering New Cell: '+readyCell.name+' ['+readyCell.namespace+']');
            this.register(readyCell);
        }
    }
};

/**
 * On Start callback, called when the bot connects to the Slack server and access the channel
 * @private
 */
GertyBot.prototype._onStart = function () {
    this._loadBotUser();
};

/**
 * On message callback, called when a message (of any type) is detected with the real time messaging API
 * @param {object} message
 * @private
 */
GertyBot.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        !this._isFromGertyBot(message)
    ) {
        this._dispatch(message);
    }
};

/**
 * Loads the user object representing the bot
 * @private
 */
GertyBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

/**
 * Util function to check if a given real time message object represents a chat message
 * @param {object} message
 * @returns {boolean}
 * @private
 */
GertyBot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

/**
 * Util function to check if a given real time message object is directed to a channel
 * @param {object} message
 * @returns {boolean}
 * @private
 */
GertyBot.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C'
        ;
};

/**
 * Util function to check if a given real time message is a gertyboy command
 * @param {object} message
 * @returns {boolean}
 * @private
 */
GertyBot.prototype._dispatch = function (message) {
    var incoming_command;
    if(incoming_command = message.text.match(this.command_detector)) {
        for (var key in this.commands) {
            if("!"+key == incoming_command[0]) {
                this.commands[key].dispatch(message);
            }
        }
    }
    return false;
};

/**
 * Util function to check if a given real time message has ben sent by the gertybot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
GertyBot.prototype._isFromGertyBot = function (message) {
    return message.user === this.user.id;
};

/**
 * Util function to get the name of a channel given its id
 * @param {string} channelId
 * @returns {Object}
 */
GertyBot.prototype.getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

/**
 * Util function to get the name of a channel given its id
 * @param {string} channelId
 * @returns {Object}
 */
GertyBot.prototype.getUserById = function (userId) {
    return this.users.filter(function (item) {
        return item.id === userId;
    })[0];
};

module.exports = GertyBot;