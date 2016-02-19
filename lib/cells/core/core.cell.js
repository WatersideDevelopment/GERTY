'use strict';

/**
 * Constructor function. It accepts a Bot and asettings object which should contain the following keys:
 *
 * @param {object} settings
 * @constructor
 *
 * @author D. Rimron-Soutter <darran@xalior.com>
 */
var CoreCell = function Constructor(GertyBot, settings) {
    var cell = this;
    this.GertyBot = GertyBot
    this.settings = settings;
    this.name = 'CoreCell';
};

/**
 * Util function to check if a given real time message is a gertyboy command
 * @param {object} message
 * @returns {boolean}
 * @private
 */
CoreCell.prototype.dispatch = function (message) {
    var incoming_command = message.text.match(this.GertyBot.command_detector);
    switch(incoming_command[0]) {
        case '!quit':
            this.GertyBot.log.info('Cell.Core._dispatch: !quit from '+message.user);
            process.exit(0);
    }
};

CoreCell.prototype.register = function () {
    this.GertyBot._register('quit', this);
};

module.exports = CoreCell;