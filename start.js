import { discord } from './src/discord/Discord.js';
import { mongo } from './src/mongo/Mongo.js';

export function start() {
	mongo();
	discord();
}

start();
