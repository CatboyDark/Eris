import { createMsg } from '../../utils/utils.js';

export {
	bridge,
	consoleLog
};

async function consoleLog(msg, consoleChannel) {
	await consoleChannel.send(filter(msg, consoleChannel));
}

async function bridge(msg, channel, fancy) {
	if (fancy) {

	}
	else {
		if (msg.event) {
			return channel.send({ embeds: [createMsg({
				color: `${msg.event === 'login' ? 'Green' : 'Red'}`,
				header: {
					icon: `https://mc-heads.net/avatar/${msg.ign}`,
					name: `${msg.ign} ${msg.event === 'login' ? 'joined.' : 'left.'}`
				}
			})] });
		}
		channel.send({ embeds: [createMsg({
			header: {
				icon: `https://mc-heads.net/avatar/${msg.sender}`,
				name: `${msg.rank ? `${msg.rank} ` : ''}${msg.sender} [${msg.guildRank}]`
			},
			desc: filter(msg.content, channel)
		})] });
	}
}

function filter(message, channel) {
	const msg = message
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
