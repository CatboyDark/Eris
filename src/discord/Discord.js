import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import fs from 'fs';
import auth from '../../auth.json' with { type: 'json' };
import { createSlash } from '../helper.js';
import display from '../display.js';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildScheduledEvents
	]
});

client.pc = new Collection();
client.sc = new Collection();

async function discord() { // Credits: Kathund

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
		client.sc.set(slashCmd.data.name, slashCmd);
		slashCommands.push(slashCmd.data.toJSON());
	}

	const rest = new REST({ version: '10' }).setToken(auth.token);
	await rest.put(Routes.applicationCommands(Buffer.from(auth.token.split('.')[0], 'base64').toString('ascii')), { body: slashCommands });

	const plainDir = fs.readdirSync('./src/discord/commands/plain').filter(file => file.endsWith('.js'));
	for (const plainFile of plainDir) {
		const plainCmd = (await import(`./commands/plain/${plainFile}`)).default;
		client.pc.set(plainCmd.name, plainCmd);
	};

	// Events
	const eventDir = fs.readdirSync('./src/discord/events').filter(file => file.endsWith('.js'));
	for (const eventFile of eventDir) {
		const event = (await import(`./events/${eventFile}`)).default;
		client.on(event.name, (...args) => event.execute(...args));
	};

	// Login
	await client.login(auth.token);
}

export { client, discord };
