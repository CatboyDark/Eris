// import { DCserver } from '../../discord/_events/clientReady.js';
import { unemojify } from 'node-emoji';
import { dcReady, DCserver } from '../discord/_events/clientReady.js';
import { config, createMsg, DCsend, getChannel, MCsend } from '../utils/utils.js';
import { minecraft } from '../minecraft/Minecraft.js';

export {
	MCconsole,
	MCbridge,
	DCbridge
};

const useBridge = config.minecraft.console.enabled || config.minecraft.bridge.guild.enabled || config.minecraft.bridge.officer.enabled;

let mcResolve;
export const minecraftReady = new Promise((res) => { mcResolve = res; });

export let bridgeReady = false;

Promise.all([dcReady, minecraftReady]).then(() => {
  if (useBridge) bridgeReady = true;
});

export function mcReady() {
  if (useBridge && mcResolve) mcResolve();
}

function MCconsole(message) {
	DCsend(config.minecraft.console.channelID, [{ desc: MCfilter(message) }], { mentions: false });
}

function MCbridge(message) {
	const bridge =
		message.channel === 'guild' ? config.minecraft.bridge.guild :
		message.channel === 'officer' ? config.minecraft.bridge.officer :
		null;

	const channel = bridge.channelID;
	const fancy = bridge.fancy;

	if (message.event) {
		if (fancy) {
			// a
		}
		else {
			getChannel(channel).send({ embeds: [createMsg.old({
				color: `${message.event === 'login' ? 'Green' : 'Red'}`,
				header: {
					icon: `https://mc-heads.net/avatar/${message.ign}`,
					name: `${message.ign} ${message.event === 'login' ? 'joined.' : 'left.'}`
				}
			})] });
			// DCsend(channel, [{
			// 	color: `${message.event === 'login' ? 'Success' : 'Error'}`,
			// 	embed: [{
			// 		// icon: { url: `https://mc-heads.net/avatar/${message.ign}` },
			// 		desc: `**${message.ign} ${message.event === 'login' ? 'joined.' : 'left.'}**`
			// 	}]
			// }]);
		}
	}
	else {
		if (fancy) {
			// a
		}
		else {
			getChannel(channel).send({ embeds: [createMsg.old({
				header: {
					icon: `https://mc-heads.net/avatar/${message.sender}`,
					name: `${message.sender} ${message.guildRank ? `[${message.guildRank}]` : ''}`
				},
				desc: MCfilter(message.content)
			})] });
			// DCsend(channel, [{
			// 	embed: [{
			// 		// icon: { url: `https://mc-heads.net/avatar/${message.sender}` },
			// 		desc: `**${message.sender}${message.guildRank ? ` [${message.guildRank}]` : ''}**\n${MCfilter(message.content)}`
			// 	}]
			// }], { mentions: message.sender === minecraft.username ? false : true });
		}
	}
}

// const bad_words = JSON.parse(fs.readFileSync('./assets/bad_words.json', 'utf8'));

let consoleChannel;

async function wait() {
	await dcReady;
	consoleChannel = getChannel(config.minecraft.console.channelID);
}

wait();

async function DCbridge(m) {
	if (!bridgeReady) return m.react('❌');

	// const sender = m.member.displayName;

	const message = DCfilter(m);

	// if (bad_words.some(word => msg.includes(word))) return;

	if (m.channel.id === consoleChannel.id) {
		if (message !== '/g disband' && !message.includes('/g transfer') && !message.includes('/g confirm')) {
			minecraft.chat(message);
		}
	}

	if (config.minecraft.bridge.guild.enabled && m.channel.id === config.minecraft.bridge.guild.channelID) {
		let content;
		if (m.reference) {
			const originalMessage = await m.channel.messages.fetch(m.reference.messageId);
			const targetUser = originalMessage.author.bot ?
				originalMessage.embeds?.[0]?.data?.author?.name.split(' ')?.[0] ??
				originalMessage.attachments.first()?.name?.replace('.png', '') ??
				originalMessage.member?.displayName :
				originalMessage.member.displayName;

			content = `${m.member.displayName} -> ${targetUser}: ${message}`;
		}
		else {
			content = `${m.member.displayName} > ${message}`;
		}

		MCsend({ channel: 'guild', sender: m.member.displayName, content, discordMessage: m });
	}

	if (config.minecraft.bridge.officer.enabled && m.channel.id === config.minecraft.bridge.officer.channelID) {
		let content;
		if (m.reference) {
			const originalMessage = await m.channel.messages.fetch(m.reference.messageId);
			targetUser = originalMessage.author.bot ?
				originalMessage.embeds?.[0]?.data.author.name.split(' ')?.[0] ??
				originalMessage.attachments.first()?.name?.replace('.png', '') ??
				originalMessage.member?.displayName :
				originalMessage.member.displayName;

			content = `${m.member.displayName} -> ${targetUser}: ${message}`;
		}
		else {
			content = `${m.member.displayName} > ${message}`;
		}

		MCsend({ channel: 'officer', sender: m.member.displayName, content, discordMessage: m });
	}
}

function DCfilter(message) {
	let content = message.content
		.replace(/\b(e+z+)\b/gi, 'e z')
		.replace(/\n/g, ' ')
		.replace(/<@!?(\d+)>/g, (_, userID) => {
			const member = DCserver.members.cache.get(userID);
			return `@${member.displayName ?? 'Unknown'}`;
		})
		.replace(/<#(\d+)>/g, (_, channelID) => {
			const targetChannel = DCserver.channels.cache.get(channelID);
			return `#${targetChannel.name ?? 'Unknown'}`;
		})
		.replace(/<a?:([\w~]+):\d+>/g, ':$1:');

	content = unemojify(content);

	if (message.attachments.size > 0) {
		let at = '';

		for (const [, attachment] of message.attachments) {
			const name = attachment.name;
			const dot = name.lastIndexOf('.');

			let clean = dot !== -1 ? name.slice(0, dot) : name;
			clean = clean.replace(/\./g, '_');

			at += `[${clean}] `;
		}

		content = content ? `${at}${content}` : at.trim();
	}

	if (message.stickers.size > 0) {
		const sticker = message.stickers.first();
		content = content ? `[${sticker.name}] ${content}` : `[${sticker.name}]`;
	}

	return content;
}

function MCfilter(message) {
	const messageF = message
		.replace(/\\/g, '\\\\')
		.replace(/([*_~#\-\[\]`>|])/g, '\\$1')
		.replace('@everyone', 'everyone@')
		.replace('@here', 'here@')
		.replace(/<@!?(\d+)>/g, (_, userID) => {
			const member = DCserver.members.cache.get(userID);
			return `<@${member.id}>`;
		})
		.replace(/@([a-zA-Z0-9_]+)/g, (_, nickname) => {
			const member = DCserver.members.cache.find(m => m.displayName.toLowerCase() === nickname.toLowerCase());
			if (!member) return `@${nickname}`;
			return `<@${member.id}>`;
		})
		.replace(/<#(\d+)>/g, (_, channelID) => {
			const targetChannel = DCserver.channels.cache.get(channelID);
			return `#${targetChannel.name ?? 'Unknown'}`;
		});

	return messageF;
}
