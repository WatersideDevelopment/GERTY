'use strict';

/**
 * Constructor function. It accepts a settings object which should contain the following keys:
 *      token : the API token of the bot (mandatory)
 *      name : the name of the bot (will default to "gertybot")
 *      joke_path : the path to access the database (will default to builtin jokes if given none)
 *
 *
 * @param {object} settings
 * @constructor
 *
 * @author D. Rimron-Soutter <darran@xalior.com>
 */
var CoreCell = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'Core Cell';
};

/**
 * Util function to check if a given real time message is a gertyboy command
 * @param {object} message
 * @returns {boolean}
 * @private
 */
CoreCell.prototype._dispatch = function (message) {

    return false;
};

CoreCell.prototype.register = function (GertyBot) {
    GertyBot.commands['quit'] = this._dispatch
};

module.exports = CoreCell;