import Canvas from 'canvas';
import fs from 'fs';
import { getChannel, readConfig } from '../utils/utils.js';
import { minecraft } from './Minecraft.js';
import { bridge, consoleLog } from './modules/bridge.js';

export { ChatManager };

async function ChatManager() {
	const config = readConfig();
	const ignore = JSON.parse(fs.readFileSync('./assets/ignore.json', 'utf8'));

	Canvas.registerFont(config.guild.bridge.font.path, { family: config.guild.bridge.font.name });

	const consoleChannel = getChannel(config.logs.console.channel);
	const guildChannel = getChannel(config.guild.bridge.guild.channel);
	const officerChannel = getChannel(config.guild.bridge.officer.channel);

	if (config.logs.console.enabled) setInterval(() => { consoleChannel.sendTyping(); }, 5000);
	if (config.guild.bridge.guild.enabled) setInterval(() => { guildChannel.sendTyping(); }, 5000);
	if (config.guild.bridge.officer.enabled) setInterval(() => { officerChannel.sendTyping(); }, 5000);

	minecraft.on('message', async (message) => {
		let msg = message.toString().trim();
		if (!msg || ignore.some((ignored) => msg.startsWith(ignored))) return;

		if (config.logs.console.enabled) {
			await consoleLog(msg, consoleChannel);
		}

		msg = getMessage(msg);
		const rawMsg = getRawMessage(message);

		if (config.guild.bridge.guild.enabled && msg.channel === 'guild') {
			await bridge(msg, rawMsg, guildChannel, config.guild.bridge.guild.fancy);
		}
		if (config.guild.bridge.officer.enabled && msg.channel === 'officer') {
			await bridge(msg, rawMsg, officerChannel, config.guild.bridge.guild.fancy);
		}
	});
}

function getMessage(message) {
	const parts = message.split(' ');

	let channel;
	switch (true) {
		case message.startsWith('Guild >'):
			channel = 'guild';
			if (!message.includes(':')) {
				const match = message.match(/^Guild > (.+) (joined|left)\.$/);
				if (match) {
					return {
						channel,
						event: match[2] === 'joined' ? 'login' : 'logout',
						ign: match[1]
					};
				}
			}
			break;
		case message.startsWith('Officer >'):
			channel = 'officer';
			break;
		case message.startsWith('Party >'):
			channel = 'party';
			break;
		case message.startsWith('From'):
			channel = 'dm';
			break;
		default:
			return {
				channel: null,
				rank: null,
				sender: null,
				guildRank: null,
				content: message.trim()
			};
	}

	let index = channel === 'dm' ? 1 : 2;

	const rank = parts[index] && parts[index].startsWith('[') && parts[index].endsWith(']')
		? parts[index].slice(1, -1)
		: null;
	if (rank) index++;

	const sender = parts[index] && parts[index].endsWith(':')
		? parts[index].slice(0, -1)
		: parts[index];
	index++;

	const guildRank = channel === 'guild' && parts[index] && parts[index].startsWith('[')
		? parts[index].substring(1, parts[index].indexOf(']'))
		: null;

	const content = message.slice(message.indexOf(':') + 1).trim();

	return { channel, rank, sender, guildRank, content };
}

const colors = JSON.parse(fs.readFileSync('./assets/colors.json', 'utf8'));

function getRawMessage(message) {
	let fullString = '';

	const colorNameToCode = {};
	colors.forEach(color => {
		colorNameToCode[color.color] = color.code;
	});

	if (message.json && message.json.color) {
		const colorCode = colorNameToCode[message.json.color] || '§r';
		fullString += colorCode;
	}
	else {
		fullString += '§r';
	}

	fullString += message.text || '';

	if (message.extra && Array.isArray(message.extra)) {
		message.extra.forEach((part) => {
			if (part.color) {
				const colorCode = colorNameToCode[part.color] || '§r';
				fullString += colorCode;
			}
			fullString += part.text || '';
		});
	}

	return fullString;
}
