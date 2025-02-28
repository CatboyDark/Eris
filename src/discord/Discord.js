import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import fs from 'fs';
import auth from '../../auth.json' with { type: 'json' };
import display from '../display.js';
import { createSlash, readConfig } from '../helper.js';

export { client, discord };

let client;

async function discord() { // Credits: Kathund
	client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildPresences,
			GatewayIntentBits.GuildScheduledEvents
		]
	});

	client.plainCommands = new Collection();
	client.slashCommands = new Collection();
	client.buttons = new Collection();

	// Commands
	const slashDir = fs.readdirSync('./src/discord/commands/slash').filter((file) => file.endsWith('.js'));
	const slashCommands = [];
	for (const slashFile of slashDir) {
		const slashCommand = (await import(`./commands/slash/${slashFile}`)).default;
		if (!slashCommand) {
			display.r(`Invalid command: ${slashFile}`);
			continue;
		}
		const slashCmd = createSlash(slashCommand);
		client.slashCommands.set(slashCmd.data.name, slashCmd);
		slashCommands.push(slashCmd.data.toJSON());
	}

	const rest = new REST({ version: '10' }).setToken(auth.token);
	await rest.put(Routes.applicationCommands(Buffer.from(auth.token.split('.')[0], 'base64').toString('ascii')), { body: slashCommands });

	const plainDir = fs.readdirSync('./src/discord/commands/plain').filter(file => file.endsWith('.js'));
	const config = readConfig();
    const prefix = config.prefix;
	for (const plainFile of plainDir) {
		const plainC = (await import(`./commands/plain/${plainFile}`)).default;
		if (plainC.prefix) {
			plainC.name = `${prefix}${plainC.name}`;
		}
		client.plainCommands.set(plainC.name, plainC);
	};

	// Buttons
	const buttonDir = fs.readdirSync('./src/discord/buttons').filter(file => file.endsWith('.js'));
	for (const buttonFile of buttonDir) {
		const buttonModule = await import(`./buttons/${buttonFile}`);
		const buttons = Object.values(buttonModule);
		for (const button of buttons) {
			client.buttons.set(button.id, button);
		}
	}

	// Events
	const eventDir = fs.readdirSync('./src/discord/events').filter(file => file.endsWith('.js'));
	for (const eventFile of eventDir) {
		const event = (await import(`./events/${eventFile}`)).default;
		client.on(event.name, (...args) => event.execute(...args));
	};

	// Login
	await client.login(auth.token);
}
