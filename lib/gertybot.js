'use strict';

/**
 * Requirements
 */
var util = require('util');
var path = require('path');
var fs = require('fs');
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
    this.commands = new Array();
    this.command_detector = new RegExp("^\![a-zA-Z0-9_-]+");

    this.log = bunyan.createLogger({
        name: this.settings.name
    });

    // Register our core functions... This can also be run by wrapper scripts to extend GERTY
    this.register(new CoreCell(this, {}));

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
 * Used by the registration of new plugins...
 * @private
 */
GertyBot.prototype._register = function (command, plugin) {
    this.log.info('Registering plugin '+plugin.name);
    this.commands[command] = plugin;
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
 * @private
 */
GertyBot.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

module.exports = GertyBot;