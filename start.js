import { Discord } from './src/discord/Discord.js';
import { Minecraft } from './src/minecraft/Minecraft.js';
import { Mongo } from './src/mongo/Mongo.js';

export function start() {
	Mongo();
	Discord();
	setTimeout(Minecraft, 5000);
}

start();
