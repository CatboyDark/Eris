const { Client } = require('hypixel-api-reborn');
const config = require('../../config.json');
module.exports = new Client(config.hypixelAPI, { cache: true });
