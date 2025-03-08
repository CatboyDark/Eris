import mineflayer from 'mineflayer';
import { createMsg, readConfig } from '../helper.js';
import fs from 'fs';
import display from '../display.js';
import { discord } from '../discord/Discord.js';

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

	const logs = discord.channels.cache.get(config.logs.bot);

	display.c(`${config.ign} has joined Hypixel.`);
	logs.send({ embeds: [createMsg({ desc: `**${config.ign} has joined Hypixel!**` })] });
}
