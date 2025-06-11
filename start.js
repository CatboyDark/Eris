import { Discord } from './src/discord/Discord.js';
// import { Minecraft } from './src/minecraft/Minecraft.js';
import { Mongo } from './src/mongo/Mongo.js';

export async function start() {
	await Mongo();
	await Discord();
	// await Minecraft();
}

start();
