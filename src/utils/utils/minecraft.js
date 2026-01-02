import { minecraft } from '../../minecraft/Minecraft.js';
import { InvalidPlayer, UnknownError } from './errors.js';
import fs from 'fs';

export {
	MCsend,
	shipIt,
	getUser
};

const messageQ = [];

function MCsend({ channel, sender = null, content, discordMessage = null }) {
	messageQ.push({ channel, sender, content, discordMessage });
}

MCsend.raw = (content) => {
	messageQ.push({ raw: true, content });
};

let shipping = false;

const prefixes = {
	guild: '/gc',
	officer: '/oc',
	party: '/pc',
	dm: '/w'
};

const spamBypass = JSON.parse(fs.readFileSync('./assets/spamBypass.json', 'utf8'));

async function shipIt() {
	if (shipping) return;
	shipping = true;

	if (!mcConnected) {
		shipping = false;
		setTimeout(shipIt, 1000);
		return;
	}

	if (!messageQ.length) {
		shipping = false;
		setTimeout(shipIt, 500);
		return;
	}

	const { raw, channel, sender, content, discordMessage } = messageQ.shift();

	if (raw) {
		minecraft.chat(content);
	}
	else {
		const prefix = prefixes[channel];

		const parts = splitText(content, 256 - (channel.length + 1));

		for (const part of parts) {
			const base = channel === 'dm' ? `${prefix} ${sender} ${part}` : `${prefix} ${part}`
			const variants = genBypass(base)

			let finalResult = 'error_duplicate'

			for (const variant of variants) {
				finalResult = await cardboard(variant, content)

				if (finalResult !== 'error_duplicate') {
					break
				}

				await new Promise(r => setTimeout(r, 500));
			}

			if (finalResult !== 'success' && discordMessage) {
				await discordMessage.react('❌');
			}
		}
	}

	shipping = false;
	setTimeout(shipIt, 500);
}

function splitText(text, maxLength) {
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

async function getUser(ign) {
	const response = await fetch(`https://mowojang.matdoes.dev/${ign}`);
	if (!response.ok) {
		switch (response.status) {
			case 404:
				throw new InvalidPlayer();
			default:
				throw new UnknownError(response);
		}
	}
	const data = await response.json();

	return {
		id: data.id,
		ign: data.name
	};
}

function genBypass(base) {
	const bypassLength = spamBypass[base.length]

	return [
		base,
		base + ' ' + '.'.repeat(bypassLength),
		base + ' ' + ','.repeat(bypassLength),
		base + ' ' + '\''.repeat(bypassLength),
	];
}

function cardboard(message, content) {
	return new Promise((resolve) => {
		const listener = (responseMessage) => {
			const response = responseMessage.toString().trim();

			if (response.includes(content)) {
				cleanup();
				resolve('success');
			}
			else if (response.includes('Advertising is against the rules.')) {
				cleanup();
				resolve('error_link');
			}
			else if (response === 'You cannot say the same message twice!') {
				cleanup();
				resolve('error_duplicate');
			}
		};

		const cleanup = () => {
			minecraft.removeListener('message', listener);
		};

		minecraft.on('message', listener);
		minecraft.chat(message);

		setTimeout(() => {
			cleanup();
			resolve('timeout');
		}, 1000);
	});
}
