import { Events } from 'discord.js';
import * as emoji from 'node-emoji';
import { mcCommands, minecraft } from '../../minecraft/Minecraft.js';
import { getChannel, readConfig, send } from '../../utils/utils.js';
// import fs from 'fs';

export default {
	name: Events.MessageCreate,

	async execute(message) {
		if (message.author.bot) return;

		const consoleChannel = getChannel(config.logs.console.channel);
		const guildChannel = getChannel(config.bridge.guild.channel);
		const officerChannel = getChannel(config.bridge.officer.channel);

		await plainCommands(message);
		await bridgeCommands(message, guildChannel, officerChannel);
		await bridge(message, consoleChannel, guildChannel, officerChannel);
	}
};

async function plainCommands(message) {
	const args = message.content.trim().split(' ');
	const commandName = args.shift().toLowerCase();

	if (message.client.plainCommands.has(commandName)) {
		const command = message.client.plainCommands.get(commandName);
		await command.execute(message, args);
		return;
	}
}

const config = readConfig();

async function bridgeCommands(message, guildChannel, officerChannel) {
	if (message.channel.id !== guildChannel.id && message.channel.id !== officerChannel.id) return;

	const args = message.content.match(/"([^"]+)"|'([^']+)'|\S+/g)?.map(arg => arg.replace(/^["']|["']$/g, '')) || [];
	const isCommand = typeof args[0] === 'string' ? args[0].toLowerCase() : null;

	if (!isCommand || !mcCommands.has(isCommand)) return;
	const command = mcCommands.get(isCommand);

	const commandChannel = message.channel.id === guildChannel.id ? 'guild' : message.channel.id === officerChannel.id ? 'officer' : null;
	if (!message.content.startsWith(isCommand) || !command.channel.includes(commandChannel)) return;

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
			send(commandChannel, message.member.displayName, content);
		}
	};

	try {
		await command.execute(fakeCommand);
	}
	catch (e) {
		console.error(e);
	}
}

// const words_blacklist = JSON.parse(fs.readFileSync('./assets/words_blacklist.json', 'utf8'));

async function bridge(message, consoleChannel, guildChannel, officerChannel) {
	if (message.author.bot) return;

	const user = message.member?.nickname ?? message.author.displayName;
	const msg = filter(message, consoleChannel);

	// Console
	if (message.channel.id === consoleChannel.id) {
		if (msg !== '/g disband' && !msg.includes('/g transfer') && !msg.includes('/g confirm')) {
			minecraft.chat(msg);
		}
	}

	// if (words_blacklist.some(word => msg.includes(word))) return;

	// Guild Chat
	if (config.bridge.guild.enabled && message.channel.id === guildChannel.id) {
		let content;
		if (message.reference) {
			const originalMessage = await message.channel.messages.fetch(message.reference.messageId);
			const targetUser =
				originalMessage.embeds?.[0].data.author.name.split(' ')?.[0] ??
				originalMessage.attachments.first()?.name?.replace('.png', '') ??
				originalMessage.member?.displayName

			content = `${user} -> ${targetUser}: ${msg}`;
		}
		else {
			content = `${user} > ${msg}`;
		}
		send('guild', null, content, message);
	}

	// Officer Chat
	if (config.bridge.officer.enabled && message.channel.id === officerChannel.id) {
		let content;
		if (message.reference) {
			const repliedTo = await message.channel.messages.fetch(message.reference.messageId);
			const targetUser = repliedTo.attachments.first()?.name.replace('.png', '') ?? repliedTo.member.displayName;

			content = `${user} -> ${targetUser}: ${msg}`;
		}
		else {
			content = `${user} > ${msg}`;
		}
		send('officer', null, content, message);
	}
}

function filter(message, consoleChannel) {
	let content = message.content;

	content = content
	.replace(/\b(e+z+)\b/gi, 'e z')
		.replace(/\n/g, ' ')
		.replace(/<@!?(\d+)>/g, (_, userID) => {
			const member = consoleChannel.guild.members.cache.get(userID);
			return `@${member.displayName ?? 'Unknown'}`;
		})
		.replace(/<#(\d+)>/g, (_, channelID) => {
			const targetChannel = consoleChannel.guild.channels.cache.get(channelID);
			return `#${targetChannel.name ?? 'Unknown'}`;
		});

		content = emoji.unemojify(content);

	if (message.attachments.size > 0) {
		content = content ? `[image] ${content}` : '[image]';
	}

	if (message.stickers.size > 0) {
		const sticker = message.stickers.first();
		content = content ? `[${sticker.name}] ${content}` : `[${sticker.name}]`;
	}

	return content;
}
