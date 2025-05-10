// import Canvas from 'canvas';
import fs from 'fs';
import { getChannel, messageQ, readConfig } from '../utils/utils.js';
import { minecraft } from './Minecraft.js';
import { bridge, consoleLog } from './modules/bridge.js';
import { commands } from './modules/commands.js';

export { ChatManager };

async function ChatManager() {
	await shipIt();

	const config = readConfig();
	const ignore = JSON.parse(fs.readFileSync('./assets/ignore.json', 'utf8'));

	// Canvas is broken. Fucking hell.
	// Canvas.registerFont(config.bridge.font.path, { family: config.bridge.font.name });

	const consoleChannel = getChannel(config.logs.console.channel);
	const guildChannel = getChannel(config.bridge.guild.channel);
	const officerChannel = getChannel(config.bridge.officer.channel);

	minecraft.on('message', async (message) => {
		let msg = message.toString().trim();
		if (!msg || ignore.some((ignored) => msg.startsWith(ignored))) return;

		if (config.logs.console.enabled) {
			await consoleLog(msg, consoleChannel);
		}

		msg = getMessage(msg);
		const rawMsg = getRawMessage(message);

		await commands(msg);

		if (config.bridge.guild.enabled && msg.channel === 'guild') {
			if (msg.sender === minecraft.username && isBridgeMessage(msg.content)) return;

			await bridge(msg, rawMsg, guildChannel, config.bridge.guild.fancy);
		}
		if (config.bridge.officer.enabled && msg.channel === 'officer') {
			console.log(msg)
			if (msg.sender === minecraft.username && isBridgeMessage(msg.content)) return;

			await bridge(msg, rawMsg, officerChannel, config.bridge.officer.fancy);
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
						ign: match[1],
						content: null
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

	const guildRank = (channel === 'guild' || channel === 'officer') && parts[index] && parts[index].startsWith('[')
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

function isBridgeMessage(message) {
	const parts = message.split(' ');
	if (parts[1] === '>' || parts[1] === '->') return true;
}

let shipping = false;

const prefixes = {
	guild: '/gc',
	officer: '/oc',
	party: '/pc',
	dm: '/w'
};

async function shipIt() {
	if (shipping) return;
	shipping = true;

	if (!messageQ.length) {
		shipping = false;
		setTimeout(shipIt, 500);
		return;
	}

	const { channel, user, content, discordMessage } = messageQ.shift();
	const prefix = prefixes[channel];

	const parts = split(content, 256 - (channel.length + 1));

	for (const part of parts) {
		const messagePromise = new Promise((resolve) => {
			const messageListener = (responseMessage) => {
				const response = responseMessage.toString().trim();

				if (response.includes(part)) {
					minecraft.removeListener('message', messageListener);
					resolve('success');
				}
				else if (response.includes('Advertising is against the rules.')) {
					minecraft.removeListener('message', messageListener);
					resolve('error_link');
				}
				else if (response === 'You cannot say the same message twice!') {
					minecraft.removeListener('message', messageListener);
					resolve('error_duplicate');
				}
			};

			minecraft.on('message', messageListener);
			minecraft.chat(channel === 'dm' ? `${prefix} ${user} ${part}` : `${prefix} ${part}`);

			setTimeout(() => {
				minecraft.removeListener('message', messageListener);
				resolve('timeout');
			}, 1000);
		});

		const result = await messagePromise;

		if (result === 'error_link') {
			if (discordMessage) {
				await discordMessage.react('❌');
			}
		}
		else if (result === 'error_duplicate') {
			if (discordMessage) {
				await discordMessage.react('❌');
			}
		}

		await new Promise(res => setTimeout(res, 500));
	}

	shipping = false;
	setTimeout(shipIt, 500);
}

function split(text, maxLength) {
	const parts = [];
	let index = '';

	for (const word of text.split(' ')) {
		if ((index + word).length + 1 > maxLength) {
			parts.push(index.trim());
			index = word + ' ';
		}
		else {
			index += word + ' ';
		}
	}
	if (index.trim()) parts.push(index.trim());
	return parts;
}
