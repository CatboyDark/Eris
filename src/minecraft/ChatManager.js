import fs from 'fs';
import { minecraft } from './Minecraft.js';
import { config, getChannel, loadFunny, MCsend, shipIt } from '../utils/utils.js';
import { bridgeReady, MCbridge, MCconsole } from '../modules/bridge.js';
import { bridgeCommands } from '../modules/bridgeCommands.js';
import { memberJoin } from '../modules/memberJoin.js';

export { ChatManager, getMessage };

const ignore = JSON.parse(fs.readFileSync('./assets/ignore.json', 'utf8'));

async function ChatManager() {
	globalThis.ChatManInitialized = true;

	await shipIt();

	if (config.minecraft.console.enabled && !getChannel(config.minecraft.console.channelID)) {
		return console.error('Error | Console Channel', 'Invalid channel ID for Minecraft console!');
	}
	if (config.minecraft.bridge.guild.enabled && !getChannel(config.minecraft.bridge.guild.channelID)) {
		return console.error('Error | Guild Channel', 'Invalid channel ID for Minecraft guild bridge!');
	}
	if (config.minecraft.bridge.officer.enabled && !getChannel(config.minecraft.bridge.officer.channelID)) {
		return console.error('Error | Officer Channel', 'Invalid channel ID for Minecraft officer bridge!');
	}

	minecraft.on('message', async (m) => {
		const rawMessage = m.toString().trim();
		if (!rawMessage || ignore.some((ignored) => rawMessage.startsWith(ignored))) return;

		const message = getMessage(rawMessage);

		message.reply = (content) => {
			MCsend(message.channel, message.sender, content);
		};

		await memberJoin(rawMessage);
		await bridgeCommands(message);
		await loadFunny.minecraft(message);

		if (bridgeReady) {
			if (config.minecraft.console.enabled) {
				MCconsole(rawMessage);
			}

			if (config.minecraft.bridge.guild.enabled && message.channel === 'guild') {
				if (message.sender === minecraft.username && isBridgeMessage(message.content)) return;

				MCbridge(message);
			}

			if (config.minecraft.bridge.officer.enabled && message.channel === 'officer') {
				if (message.sender === minecraft.username && isBridgeMessage(message.content)) return;

				MCbridge(message);
			}
		}
	});
}

const colors = JSON.parse(fs.readFileSync('./assets/colors.json', 'utf8'));

const getMessage = (m) => {
	const message = m.toString().trim();
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

	const content = (() => {
		const afterColon = message.slice(message.indexOf(':') + 1).trim();
		const nl = afterColon.indexOf('\n');
		return nl === -1 ? afterColon : afterColon.slice(0, nl).trim();
	})();

	return { channel, rank, sender, guildRank, content };
};

getMessage.raw = (message) => {
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
};

function isBridgeMessage(message) {
	const parts = message.split(' ');
	if (parts[1] === '>' || parts[1] === '->') return true;
}
