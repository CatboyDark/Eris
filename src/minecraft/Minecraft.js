import fs from 'fs';
import mineflayer from 'mineflayer';
import { display, readConfig } from '../utils/utils.js';
import { ChatManager } from './ChatManager.js';
import { mcEvents } from './modules/events.js';

export { mcCommands, messages, Minecraft, minecraft };

let minecraft;
const messages = new Map();
const mcCommands = new Map();

async function Minecraft() {
	const config = readConfig();

	const bot = {
		host: 'mc.hypixel.net',
		username: config.ign,
		auth: 'microsoft',
		version: '1.8.9',
		viewDistance: 'tiny',
		chatLengthLimit: 256,
		profilesFolder: './cache/minecraft'
	};

	minecraft = mineflayer.createBot(bot);

	// Commands
	const cDir = fs.readdirSync('./src/minecraft/commands').filter((file) => file.endsWith('.js'));
	for (const cFile of cDir) {
		const cModule = (await import(`./commands/${cFile}`)).default;
		const cList = Array.isArray(cModule) ? cModule : [cModule];

		if (!config.commands[cFile.replace('.js', '')]) {
			display.y(`Disabling command: ${cFile.replace('.js', '')}`);
			continue;
		}

		for (const command of cList) {
			if (!command) {
				display.y(`Invalid command: ${cFile.replace('.js', '')}`);
				continue;
			}

			command.name = command.prefix ? `${config.prefix}${command.name}` : command.name;
			mcCommands.set(command.name.toLowerCase(), command);

			if (command.aliases) {
				for (const alias of command.aliases) {
					const aliasName = command.prefix ? `${config.prefix}${alias}` : alias;
					mcCommands.set(aliasName, command);
				}
			}
		}
	}

	await mcEvents();
	await ChatManager();
}
