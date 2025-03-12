import mineflayer from 'mineflayer';
import { createMsg, getMsg, readConfig } from '../helper.js';
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
		if (command.prefix) {
			command.name = `${config.prefix}${command.name}`;
		}
		commands.set(command.name, command);
	}

	minecraft.on('message', (message) => {
		const msg = getMsg(message.toString());
		if (!msg || !msg.channel) return;

		const args = msg.content.trim().split(/ +/);
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

			const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
			let rString = '';

			for (let i = 0; i < 5; i++) {
				const rIndex = Math.floor(Math.random() * chars.length);
				rString += chars[rIndex];
			}
			await minecraft.chat(`${prefix} ${content} -${rString}-`);
		};

		try {
			command.execute(msg);
		}
		catch (e) {
			console.log(e);
		}
	});

	const logs = discord.channels.cache.get(config.logs.bot);

	display.c(`${config.ign} has joined Hypixel.`);
	logs.send({ embeds: [createMsg({ desc: `**${config.ign} has joined Hypixel!**` })] });
}
