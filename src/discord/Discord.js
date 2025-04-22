import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import fs from 'fs';
import auth from '../../auth.json' with { type: 'json' };
import { createSlash, display, readConfig } from '../utils/utils.js';

export { Discord, discord };

let discord;

async function Discord() { // Credits: Kathund
	discord = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildPresences,
			GatewayIntentBits.GuildScheduledEvents
		]
	});

	discord.plainCommands = new Collection();
	discord.slashCommands = new Collection();
	discord.buttons = new Collection();

	// Commands
	const slashDir = fs.readdirSync('./src/discord/commands/slash').filter((file) => file.endsWith('.js'));
	const slashCommands = [];
	for (const slashFile of slashDir) {
		const slashCommand = (await import(`./commands/slash/${slashFile}`)).default;
		if (!slashCommand) {
			display.y(`Invalid command: ${slashFile}`);
			continue;
		}
		const slashCmd = createSlash(slashCommand);
		discord.slashCommands.set(slashCmd.data.name, slashCmd);
		slashCommands.push(slashCmd.data.toJSON());
	}

	const rest = new REST({ version: '10' }).setToken(auth.token);
	await rest.put(Routes.applicationCommands(Buffer.from(auth.token.split('.')[0], 'base64').toString('ascii')), { body: slashCommands });

	const plainDir = fs.readdirSync('./src/discord/commands/plain').filter(file => file.endsWith('.js'));
	const config = readConfig();
	const prefix = config.prefix;
	for (const plainFile of plainDir) {
		const plainCommand = (await import(`./commands/plain/${plainFile}`)).default;
		if (!plainCommand) {
			display.y(`Invalid command: ${plainFile}`);
			continue;
		}
		if (plainCommand.prefix) {
			plainCommand.name = `${prefix}${plainCommand.name}`;
		}
		discord.plainCommands.set(plainCommand.name, plainCommand);
	};

	// Buttons
	const buttonDir = fs.readdirSync('./src/discord/buttons').filter(file => file.endsWith('.js'));
	for (const buttonFile of buttonDir) {
		const button = await import(`./buttons/${buttonFile}`);
		const buttons = button.default || [];
		for (const b of buttons) {
			discord.buttons.set(b.id, b);
		}
	}

	// Events
	const eventDir = fs.readdirSync('./src/discord/events').filter(file => file.endsWith('.js'));
	for (const eventFile of eventDir) {
		const event = (await import(`./events/${eventFile}`)).default;
		discord.on(event.name, (...args) => event.execute(...args));
	};

	await discord.login(auth.token);

	return new Promise(async (resolve) => {
		discord.once('ready', async () => {
			resolve();
		});
	});
}
