import { minecraft } from '../../minecraft/Minecraft.js';
import { InvalidPlayer, UnknownError } from './errors.js';

export {
	MCsend,
	shipIt,
	getUser
};

const messageQ = [];

function MCsend(channel, sender = null, content, discordMessage = null) {
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
				minecraft.chat(channel === 'dm' ? `${prefix} ${sender} ${part}` : `${prefix} ${part}`);

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
