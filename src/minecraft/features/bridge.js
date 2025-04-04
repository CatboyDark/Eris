import { discord } from '../../discord/Discord.js';
import { createImage, readConfig, sendMessage, writeConfig } from '../../helper.js';
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
		const msg = filter(message.toString().trim());

		if (msg.length < 1 || ignore.some((ignored) => msg.startsWith(ignored))) return;

		consoleChannel.send(msg);

		let isBridge = false;
		for (const [bridgeMsg, type] of messages.entries()) {
			if (type === 'bridge' && msg.includes(bridgeMsg.substring(4))) {
				isBridge = true;
				break;
			}
		}

		if (isBridge) return;

		if (config.bridge.guild.enabled) {
			if (msg.startsWith('Guild >')) {
				const fullMessage = getFullString(message).replace('§2Guild > ', '');
				const messageImage = await createImage(fullMessage);
				guildChannel.send({ files: [messageImage] });
			}
		}

		if (config.bridge.officer.enabled) {
			if (msg.startsWith('Officer >')) {
				const fullMessage = getFullString(message).replace('§3Officer > ', '');
				const messageImage = await createImage(fullMessage);
				officerChannel.send({ files: [messageImage] });
			}
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
			if (message.reference) {
				const repliedTo = await message.channel.messages.fetch(message.reference.messageId);
				const targetUser = repliedTo.member?.nickname ?? repliedTo.author.displayName;
				const messageToSend = `/gc ${user} -> ${targetUser}: ${msg}`;
				messages.set(messageToSend, 'bridge');
				await sendMessage(messageToSend);
			}
			else {
				const messageToSend = `/gc ${user} > ${msg}`;
				messages.set(messageToSend, 'bridge');
				await sendMessage(messageToSend);
			}
		}

		// Officer Chat
		if (config.bridge.officer.enabled && message.channel.id === officerChannel.id) {
			if (message.reference) {
				const repliedTo = await message.channel.messages.fetch(message.reference.messageId);
				const targetUser = repliedTo.member?.nickname ?? repliedTo.author.displayName;
				const messageToSend = `/oc ${user} -> ${targetUser}: ${msg}`;
				messages.set(messageToSend, 'bridge');
				await sendMessage(messageToSend);
			}
			else {
				const messageToSend = `/oc ${user} > ${msg}`;
				messages.set(messageToSend, 'bridge');
				await sendMessage(messageToSend);
			}
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

function getFullString(message) {
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
