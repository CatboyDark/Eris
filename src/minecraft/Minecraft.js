import mineflayer from 'mineflayer';
import { readConfig } from '../helper.js';
import fs from 'fs';
import display from '../display.js';

export { Minecraft, minecraft };

let minecraft;

async function Minecraft() {
	const config = readConfig();

	const bot = {
		host: 'mc.hypixel.net',
		username: config.ign,
		auth: 'microsoft',
		version: '1.8.9',
		viewDistance: 'tiny',
		chatLengthLimit: 256
	};

	minecraft = mineflayer.createBot(bot);

	// Features
	const fFiles = fs.readdirSync('./src/minecraft/features').filter((file) => file.endsWith('.js'));
	for (const f of fFiles) {
		const module = await import(`./features/${f}`);
		const feature = module.default;
		if (feature) {
			feature();
		}
		else {
			display.r(`Invalid feature: ${f}`);
		}
	}
}
