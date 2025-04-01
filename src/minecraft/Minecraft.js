import mineflayer from 'mineflayer';
import { getMsg, readConfig } from '../helper.js';
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
		const feature = (await import(`./features/${f}`)).default;
		if (feature) {
			feature();
		}
	}

	// Commands
	const commands = new Map();
	const commandDir = fs.readdirSync('./src/minecraft/commands').filter((file) => file.endsWith('.js'));
	for (const commandFile of commandDir) {
		const command = (await import(`./commands/${commandFile}`)).default;
		if (!command) {
			display.r(`Invalid command: ${commandFile}`);
			continue;
		}

		command.name = command.prefix ? `${config.prefix}${command.name}` : command.name;
		commands.set(command.name, command);

		if (command.aliases) {
			for (const alias of command.aliases) {
				const aliasName = command.prefix ? `${config.prefix}${alias}` : alias;
				commands.set(aliasName, command);
			}
		}
	}

	minecraft.on('message', (message) => {
		const msg = getMsg(message.toString());
		if (!msg || !msg.channel) return;

		const args = msg.content.match(/"([^"]+)"|'([^']+)'|\S+/g)?.map(arg => arg.replace(/^["']|["']$/g, '')) || [];
		const commandName = args.shift().toLowerCase();
		const command = commands.get(commandName);

		if (!command || !msg.content.startsWith(commandName) || !command.channel.includes(msg.channel)) return;

		const options = {};
		if (command.options) {
			command.options.forEach((option, index) => {
				options[option] = args[index];
			});
		}

		msg.options = options;
		msg.reply = async (content) => {
			let prefix;
			switch (msg.channel) {
				case 'guild':
					prefix = '/gc';
					break;
				case 'officer':
					prefix = '/oc';
					break;
				case 'party':
					prefix = '/pc';
					break;
				case 'dm':
					prefix = `/w ${msg.sender}`;
					break;
			}

			await minecraft.chat(`${prefix} ${content}`);
			// await minecraft.chat(`${prefix} ${content} -${rString}-`);
		};

		try {
			command.execute(msg);
		}
		catch (e) {
			console.log(e);
		}
	});
}

function rString (length) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	let rString = '';

	for (let i = 0; i < length; i++) {
		const rIndex = Math.floor(Math.random() * chars.length);
		rString += chars[rIndex];
	}

	return rString;
}
