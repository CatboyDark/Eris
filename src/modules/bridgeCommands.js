import { config, getChannel, MCsend } from '../utils/utils.js';
import { mcCommands, minecraft } from '../minecraft/Minecraft.js';
import { dcReady } from '../discord/_events/clientReady.js';

export { bridgeCommands, fakeBridgeCommands };

async function bridgeCommands(message) {
	if (!message.channel || message.sender === minecraft.username || message.event) return;

	const args = message.content.match(/"([^"]+)"|'([^']+)'|\S+/g)?.map(arg => arg.replace(/^["']|["']$/g, '')) || [];
	const commandName = args[0].toLowerCase();

	if (!commandName || !mcCommands.has(commandName)) return;

	const command = mcCommands.get(commandName);
	if (!command.channels.includes(message.channel)) return;

	const options = {};
	if (command.options) {
		command.options.forEach((option, index) => {
			options[option] = args[index + 1];
		});
	}

	message.options = options;

	try {
		command.execute(message);
	}
	catch (e) {
		console.error(`Error | Minecraft Command: ${commandName}`, e);
	}
}

let guildChannel;
let officerChannel;

async function wait() {
	await dcReady;
	guildChannel = getChannel(config.minecraft.bridge.guild.channelID);
	officerChannel = getChannel(config.minecraft.bridge.officer.channelID);
}

wait();

async function fakeBridgeCommands(message) {
	const isGuild = message.channel.id === guildChannel.id;
	const isOfficer = message.channel.id === officerChannel.id;

	if ((!isGuild && !isOfficer) || (isGuild && !config.minecraft.bridge.guild.enabled) || (isOfficer && !config.minecraft.bridge.officer.enabled)) return;

	const args = message.content.match(/"([^"]+)"|'([^']+)'|\S+/g)?.map(arg => arg.replace(/^["']|["']$/g, '')) || [];
	const commandName = typeof args[0] === 'string' ? args[0].toLowerCase() : null;

	if (!commandName || !mcCommands.has(commandName)) return;

	const command = mcCommands.get(commandName);
	const channel = isGuild ? 'guild' : isOfficer ? 'officer' : null;
	if (!command.channels.includes(channel)) return;

	const options = {};
	if (command.options) {
		command.options.forEach((option, index) => {
			options[option] = args[index + 1];
		});
	}

	const fakeCommand = {
		sender: message.member.displayName,
		options,
		reply: (content) => {
			MCsend({ channel, sender: message.member.displayName, content });
		}
	};

	try {
		command.execute(fakeCommand);
	}
	catch (e) {
		console.error(`Error | Minecraft Command: ${commandName}`, e);
	}
}
