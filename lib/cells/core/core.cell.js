'use strict';

/**
 * Constructor function. It accepts a Bot object.
 *
 * @param {object}  GertyBot
 * @constructor
 *
 * @author D. Rimron-Soutter <darran@xalior.com>
 */
var CoreCell = function Constructor(GertyBot) {
    this.GertyBot = GertyBot;
    this.settings = this.GertyBot.settings;
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
            this.GertyBot.log.info('Cell.Core._dispatch: !quit from @'
                + (this.GertyBot.getUserById(message.user).name));
            process.exit(0);
    }
};

CoreCell.prototype.register = function () {
    this.GertyBot._register('quit', this);
};

module.exports = CoreCell;