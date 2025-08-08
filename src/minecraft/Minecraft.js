import fs from 'fs';
import mineflayer from 'mineflayer';
import { config, DCsend } from '../utils/utils.js';
import { ChatManager } from './ChatManager.js';
import { mcReady } from '../modules/bridge.js';

export { Minecraft, mcCommands };

export let minecraft;
const mcCommands = new Map();

async function Minecraft() {
	if (!config.minecraft.enabled) return;

	minecraft = mineflayer.createBot({
		host: 'mc.hypixel.net',
		username: config.ign,
		auth: 'microsoft',
		version: '1.8.9',
		viewDistance: 'tiny',
		chatLengthLimit: 256,
		profilesFolder: './.cache/minecraft'
	});

	await mcEvents();
	await loadCommands();
}

globalThis.mcConnected = false;
globalThis.ChatManInitialized = false;

async function mcEvents() {
	minecraft.on('kicked', (reason) => {
		globalThis.mcConnected = false;

		console.yellow(`Minecraft | Kicked: ${reason}`);
		reconnect();
	});

	minecraft.on('end', (reason) => {
		globalThis.mcConnected = false;

		console.yellow(`Minecraft | Disconnected: ${reason}`);
		reconnect();
	});

	minecraft.on('error', (error) => {
		console.error(`Minecraft | ${error.message}`);
	});

	function reconnect() {
		console.yellow('Attempting to reconnect...');
		setTimeout(Minecraft, 5000);
	}

	minecraft.once('spawn', async () => {
		globalThis.mcConnected = true;

		console.cyan(`${minecraft.username} is online!`);
		DCsend(config.logs.bot.channelID, [{ embed: [{ desc: `**${minecraft.username}** is online!` }]} ]);

		minecraft.chat('/limbo');
		if (!globalThis.ChatManInitialized) await ChatManager();
		mcReady();
	});
}

async function loadCommands() {
	const dir = fs.readdirSync('./src/minecraft/commands').filter(file => file.endsWith('.js'));
	const seen = new Set();

	for (const file of dir) {
		const commandName = file.replace('.js', '');
		if (!config.minecraft.commands[commandName]) {
			console.yellow(`Disabling MC command: ${commandName}`);
			continue;
		}

		const command = (await import(`./commands/${file}`)).default;
		const commands = Array.isArray(command) ? command : [command];

		for (const c of commands) {
			if (!c || !c.name) {
				console.yellow(`Invalid MC command: ${commandName}`);
				continue;
			}

			const entries = [];
			const baseName = c.prefix ? `${config.prefix}${c.name}` : c.name;
			entries.push(baseName.toLowerCase());

			if (Array.isArray(c.aliases)) {
				for (const alias of c.aliases) {
					const aliasName = c.prefix ? `${config.prefix}${alias}` : alias;
					entries.push(aliasName.toLowerCase());
				}
			}

			for (const name of entries) {
				if (seen.has(name)) {
					console.error(`Error | MC command name conflict: ${name} from ${file}`);
					continue;
				}
			}

			for (const name of entries) {
				seen.add(name);
				mcCommands.set(name, c);
			}
		}
	}
}
