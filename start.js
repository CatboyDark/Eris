const { token } = require('./config.json');
const DCinit = require('./src/discord/DCinit');
const MCinit = require('./src/minecraft/MCinit');

const start = async () =>
{
	new DCinit(token);
};

start();