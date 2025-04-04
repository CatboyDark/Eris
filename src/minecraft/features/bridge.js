import { discord } from '../../discord/Discord.js';
import { createImage, getMessage, readConfig, sendMessage, writeConfig } from '../../helper.js';
import { messages, minecraft } from '../Minecraft.js';
import * as emoji from 'node-emoji';
import fs from 'fs';
import Canvas from 'canvas';

export default async () => {
	const config = readConfig();
	const ignore = JSON.parse(fs.readFileSync('./assets/ignore.json', 'utf8'));

	Canvas.registerFont(config.bridge.font.path, { family: config.bridge.font.name });

	const logsChannel = discord.channels.cache.get(config.logs.channel);
	let consoleChannel = logsChannel.threads.cache.find(x => x.name === 'Console');
	if (!consoleChannel) {
		consoleChannel = await logsChannel.threads.create({ name: 'Console' });
		config.logs.console = consoleChannel.id;
		writeConfig(config);
	}

	const guildChannel = discord.channels.cache.get(config.bridge.guild.channel);
	const officerChannel = discord.channels.cache.get(config.bridge.officer.channel);

	minecraft.on('message', async (message) => {
		const msg = getMessage(message.toString().trim());
		const msgF = filter(message.toString().trim());

		if (msgF.length < 1 || ignore.some((ignored) => msgF.startsWith(ignored))) return;

		consoleChannel.send(msgF);

		let isBridge = false;
		for (const [bridgeMsg, type] of messages.entries()) {
			if (type === 'bridge' && msgF.includes(bridgeMsg.substring(4))) {
				isBridge = true;
				break;
			}
		}

		if (isBridge) return;

		if (config.bridge.guild.enabled && msgF.startsWith('Guild >')) {
			const fullMessage = getFullMessage(message).replace('§2Guild > ', '');
			const image = await createImage(fullMessage);
			const imageName = `${msg.sender}.png`;
			guildChannel.send({ files: [image.setName(imageName)] });
		}

		if (config.bridge.officer.enabled && msgF.startsWith('Officer >')) {
			const fullMessage = getFullMessage(message).replace('§3Officer > ', '');
			const image = await createImage(fullMessage);
			const imageName = `${msg.sender}.png`;
			officerChannel.send({ files: [image.setName(imageName)] });
		}
	});

	discord.on('messageCreate', async (message) => {
		if (message.author.bot) return;

		const user = message.member?.nickname ?? message.author.displayName;
		const msg = filter(message);

		// Console
		if (message.channel.id === consoleChannel.id) {
			if (msg !== '/g disband' && !msg.includes('/g transfer') && !msg.includes('/g confirm')) {
				minecraft.chat(msg);
			}
		}

		// Guild Chat
		if (config.bridge.guild.enabled && message.channel.id === guildChannel.id) {
			let messageToSend;
			if (message.reference) {
				const repliedTo = await message.channel.messages.fetch(message.reference.messageId);
				const attachment = repliedTo.attachments.first();
				const targetUser = attachment?.name?.replace('.png', '') ?? repliedTo.member?.nickname ?? repliedTo.author.displayName;

				messageToSend = `/gc ${user} -> ${targetUser}: ${msg}`;
			}
 else {
				messageToSend = `/gc ${user} > ${msg}`;
			}
			messages.set(messageToSend, 'bridge');
			await sendMessage(messageToSend);
		}

		// Officer Chat
		if (config.bridge.officer.enabled && message.channel.id === officerChannel.id) {
			let messageToSend;
			if (message.reference) {
				const repliedTo = await message.channel.messages.fetch(message.reference.messageId);

				// Extract the sender's name from the image filename
				const attachment = repliedTo.attachments.first();
				const targetUser = attachment?.name?.replace('.png', '') ?? repliedTo.member?.nickname ?? repliedTo.author.displayName;

				messageToSend = `/oc ${user} -> ${targetUser}: ${msg}`;
			}
 else {
				messageToSend = `/oc ${user} > ${msg}`;
			}
			messages.set(messageToSend, 'bridge');
			await sendMessage(messageToSend);
		}
	});
};

function filter(message) {
	const discordMessage = typeof message === 'object';
	let content = discordMessage ? message.content : message;

	if (discordMessage) {
		content = content
			.replace(/\n/g, ' ')
			.replace(/<@!?(\d+)>/g, (_, id) => {
				const member = message.guild.members.cache.get(id);
				return `@${member.nickname ?? member.user.displayName}`;
			})
			.replace(/<#(\d+)>/g, (_, channelId) => {
				const channel = discord.channels.cache.get(channelId);
				return channel ? `#${channel.name}` : `<#${channelId}>`;
			});

		content = emoji.unemojify(content);

		if (message.attachments.size > 0) {
			content = content ? `[image] ${content}` : '[image]';
		}

		if (message.stickers.size > 0) {
			const sticker = message.stickers.first();
			content = content ? `[${sticker.name}] ${content}` : `[${sticker.name}]`;
		}
	}
	else {
		content = content
			.replace('@everyone', 'everyone')
			.replace('@here', 'here');
	}

	return content;
}

const colors = JSON.parse(fs.readFileSync('./assets/colors.json', 'utf8'));

function getFullMessage(message) {
	let fullString = '';

	const colorNameToCode = {};
	colors.forEach(color => {
		colorNameToCode[color.color] = color.code;
	});

	if (message.json && message.json.color) {
		const colorCode = colorNameToCode[message.json.color] || '§f';
		fullString += colorCode;
	}
	else {
		fullString += '§f';
	}

	fullString += message.text || '';

	if (message.extra && Array.isArray(message.extra)) {
		message.extra.forEach((part) => {
			if (part.color) {
				const colorCode = colorNameToCode[part.color] || '§f';
				fullString += colorCode;
			}
			fullString += part.text || '';
		});
	}

	return fullString;
}
