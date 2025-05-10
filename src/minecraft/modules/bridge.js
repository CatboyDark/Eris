import { createImage, createMsg } from '../../utils/utils.js';

export {
	bridge,
	consoleLog
};

async function consoleLog(msg, consoleChannel) {
	await consoleChannel.send(filter(msg, consoleChannel));
}

async function bridge(msg, rawMsg, channel, fancy) {
	if (fancy) {
		msg.channel === 'guild'
			? rawMsg.replace('§2Guild > ', '')
			: rawMsg.replace('§3Officer > ', '');
		const image = await createImage(rawMsg);
		await channel.send({ files: [image.setName(`${msg.sender}.png`)] });
	}
	else {
		if (msg.event) {
			channel.send({ embeds: [createMsg({
				color: `${msg.event === 'login' ? 'Green' : 'Red'}`,
				header: {
					icon: `https://mc-heads.net/avatar/${msg.ign}`,
					name: `${msg.ign} ${msg.event === 'login' ? 'joined.' : 'left.'}`
				}
			})] });
		}
		else {
			channel.send({ embeds: [createMsg({
				header: {
					icon: `https://mc-heads.net/avatar/${msg.sender}`,
					name: `${msg.sender} ${msg.guildRank ? `[${msg.guildRank}]` : ''}`
				},
				desc: filter(msg.content, channel)
			})] });
		}
	}
}

function filter(message, channel) {
	const msg = message
		.replace(/\\/g, '\\\\')
		.replace(/([*_~#\-\[\]`>q|])/g, '\\$1')
		.replace('@everyone', '(everyone)')
		.replace('@here', '(here)')
		.replace(/<@!?(\d+)>/g, (_, userID) => {
			const member = channel.guild.members.cache.get(userID);
			return `@${member.displayName ?? 'Unknown'}`;
		})
		.replace(/<#(\d+)>/g, (_, channelID) => {
			const targetChannel = channel.guild.channels.cache.get(channelID);
			return `#${targetChannel.name ?? 'Unknown'}`;
		});

	return msg;
}
