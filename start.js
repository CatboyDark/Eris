import { Discord } from './src/discord/Discord.js';
import { Minecraft } from './src/minecraft/Minecraft.js';
import { Mongo } from './src/mongo/Mongo.js';

export async function start() {
	process.on('unhandledRejection', (reason, promise) => {
		console.error('Unhandled Rejection at:', promise, 'reason:', reason);
	});

	process.on('uncaughtException', (err) => {
		console.error('There was an uncaught error', err);
		process.exit(1);
	});

	await Mongo();
	await Discord();
	await Minecraft();

}

start();
