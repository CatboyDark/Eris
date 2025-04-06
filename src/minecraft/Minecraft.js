import mineflayer from 'mineflayer';
import { getMessage, readConfig, sendMessage, display } from '../utils/utils.js';
import fs from 'fs';

export { Minecraft, minecraft, messages };

let minecraft;
const messages = new Map();

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
		const commandModule = (await import(`./commands/${commandFile}`)).default;
		const commandList = Array.isArray(commandModule) ? commandModule : [commandModule];

		for (const command of commandList) {
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
	}

	minecraft.on('message', (message) => {
		const msg = getMessage(message.toString());
		if (!msg || !msg.channel) return;
		if (msg.sender === minecraft.username) return;

		const args = msg.content.match(/"([^"]+)"|'([^']+)'|\S+/g)?.map(arg => arg.replace(/^["']|["']$/g, '')) || [];
		const commandName = args.length > 0 ? args[0].toLowerCase() : null;

		if (!commandName || !commands.has(commandName)) return;

		const command = commands.get(commandName);
		if (!msg.content.startsWith(commandName) || !command.channel.includes(msg.channel)) return;

		const options = {};
		if (command.options) {
			command.options.forEach((option, index) => {
				options[option] = args[index + 1];
			});
		}

		msg.options = options;
		msg.reply = async (content) => {
			const prefixMap = {
				guild: 'gc',
				officer: 'oc',
				party: 'pc',
				dm: `w ${msg.sender}`
			};

			const prefix = `/${prefixMap[msg.channel]}`;
			const message = `${prefix} ${content}`;
			messages.set(message, 'command');

			await sendMessage(message);
		};

		try {
			command.execute(msg);
		}
		catch (e) {
			console.error(e);
		}
	});
}
