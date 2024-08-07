const DCinit = require('./src/discord/DCinit');
const MCinit = require('./src/minecraft/MCinit');
const Mongo = require('./src/mongo/mongoInit');

const start = async () =>
{
	await Mongo();
	new DCinit();
};

start();