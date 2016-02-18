#!/usr/bin/env node

'use strict';

/**
 * GertyBot launcher script.
 *
 * @author D. Rimron-Soutter <darran@xalior.com>
 */

var GertyBot = require('./lib/gertybot');
var config = require('./config');

/**
 * How to configure your GERTY:
 *
 *  BOT_API_KEY : obtain from https://<yourorganization>.slack.com/services/new/bot (Mandatory)
 *  BOT_JOKE_PATH: the path of the jokes.js file used by the bot
 *  BOT_NAME: the nickname within your organisation.
 */
config.token = process.env.BOT_API_KEY || config.token;
config.name = process.env.BOT_NAME || config.name;

var GERTY = new GertyBot(config);

GERTY.run();
