import fs from 'fs';
import Canvas from 'canvas';
import { messages, minecraft } from '../minecraft/Minecraft.js';
import { readConfig } from './utils.js';
import { AttachmentBuilder } from 'discord.js';

export {
	createImage,
	getMessage,
	sendMessage
};

const config = readConfig();
const colors = JSON.parse(fs.readFileSync('./assets/colors.json', 'utf8'));

async function createImage(text) {
	const canvasWidth = 1100;
	const fontSize = config.bridge.font.size;
	const fontName = config.bridge.font.name;
	const lineHeight = 40;

	const blank = Canvas.createCanvas(1, 1);
	const blankCTX = blank.getContext('2d');
	blankCTX.font = `${fontSize}px ${fontName}`;

	const colorMap = {};
	colors.forEach(color => {
		colorMap[color.code] = color;
	});

	const parts = [];
	let index = 0;
	while (index < text.length) {
		if (text[index] === '§' && index + 1 < text.length) {
			const code = `§${text[index + 1]}`;
			index += 2;
			let message = '';
			while (index < text.length && text[index] !== '§') {
				message += text[index];
				index++;
			}
			parts.push({ code, message });
		}
		else {
			let message = '';
			while (index < text.length && text[index] !== '§') {
				message += text[index];
				index++;
			}
			if (message.length > 0) {
				parts.push({ code: '§f', message });
			}
		}
	}

	const lines = [];
	let currentLine = [];
	let currentLineWidth = 0;

	for (const part of parts) {
		const { code, message } = part;
		const words = message.split(' ');

		for (let i = 0; i < words.length; i++) {
			const word = words[i];
			const wordWidth = blankCTX.measureText(word).width;
			const spaceWidth = i > 0 ? blankCTX.measureText(' ').width : 0;

			if (currentLineWidth + wordWidth + spaceWidth > canvasWidth - 20) {
				lines.push(currentLine);
				currentLine = [];
				currentLineWidth = 0;
				currentLine.push({ code, text: word });
				currentLineWidth = wordWidth;
			}
			else {
				const textToAdd = currentLineWidth > 0 && i > 0 ? ` ${word}` : word;
				currentLine.push({ code, text: textToAdd });
				currentLineWidth += wordWidth + spaceWidth;
			}
		}
	}

	if (currentLine.length > 0) {
		lines.push(currentLine);
	}

	const canvasHeight = lines.length * lineHeight;
	const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	ctx.font = `${fontSize}px ${fontName}`;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		let xOffset = 20;
		const textYPosition = (i * lineHeight) + 28;

		for (const part of line) {
			const colorData = colorMap[part.code] || colorMap['§f'];

			ctx.fillStyle = colorData.shadow;
			ctx.fillText(part.text, xOffset + 4, textYPosition + 4);

			ctx.fillStyle = colorData.hex;
			ctx.fillText(part.text, xOffset, textYPosition);

			xOffset += ctx.measureText(part.text).width;
		}
	}

	const buffer = canvas.toBuffer('image/png');
	return new AttachmentBuilder(buffer, { name: 'image.png' });
}

function getMessage(message) {
	const parts = message.split(' ');

	let channel;
	switch (true) {
		case message.startsWith('Guild >'):
			channel = 'guild';
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
			return null;
	}

	let index = channel === 'dm' ? 1 : 2;

	const rank = parts[index] && parts[index].startsWith('[') && parts[index].endsWith(']')
		? parts[index].slice(1, -1)
		: null;
	index++;

	const sender = parts[index] && parts[index].endsWith(':')
		? parts[index].slice(0, -1)
		: parts[index];
	index++;

	const guildRank = channel === 'guild' && parts[index] && parts[index].startsWith('[')
		? parts[index].substring(1, parts[index].indexOf(']'))
		: null;

	const content = message.slice(message.indexOf(':') + 1).trim() ?? null;

	return { channel, rank, sender, guildRank, content };
}

function parseCommand(message) {
	const parts = message.trim().split(' ');
	const command = `/${parts[0].toLowerCase()}`;
	const params = parts.slice(1).join(' ');

	return { command, params };
}

const messageQ = [];
let sending = false;

async function sendMessage(message) {
	return new Promise((resolve) => {
		messageQ.push({
			originalMessage: message,
			currentMessage: message,
			resolve
		});

		if (!sending) {
			processQ();
		}
	});
}

function rString(message, retryCount) {
	const chars = 'abcdefghijlmnopqrstuvwxyzABCDEFGHIJLMNOPQRSTUVWXYZ';

	let len = 0;
	if (message.length <= 5) len = 1;
	else if (message.length <= 10) len = 2;
	else if (message.length <= 15) len = 3;
	else if (message.length <= 21) len = 4;
	else if (message.length <= 27) len = 5;
	else len = 6;

	const char = chars[retryCount % chars.length];
	return `-${char.repeat(len)}-`;
}

async function processQ() {
	if (messageQ.length === 0) {
		sending = false;
		return;
	}

	sending = true;
	const { originalMessage, currentMessage, resolve, retryCount = 0 } = messageQ[0];

	let messageConfirmed = false;
	let messageError = false;

	try {
		minecraft.chat(currentMessage);
	}
	catch {
		messageError = true;
	}

	const messageListener = (response) => {
		const responseString = response.toString().trim();

		const parsed = parseCommand(currentMessage);

		if (responseString === currentMessage ||
			(parsed && responseString.includes(parsed.params))) {
			messageConfirmed = true;
			minecraft.removeListener('message', messageListener);
			messages.delete(originalMessage);

			messageQ.shift();
			resolve(true);
			setTimeout(processQ, 500);
		}
	};

	minecraft.on('message', messageListener);

	setTimeout(() => {
		if (!messageConfirmed && !messageError) {
			minecraft.removeListener('message', messageListener);

			const newMessage = `${originalMessage} ${rString(originalMessage, retryCount)}`;
			console.log(newMessage);
			messageQ[0] = {
				originalMessage,
				currentMessage: newMessage,
				resolve,
				retryCount: retryCount + 1
			};

			setTimeout(processQ, 500);
		}
	}, 1000);
}
