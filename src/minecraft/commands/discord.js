import { getDiscord, getPlayer } from '../../helper.js';

export default {
	name: 'discord',
	prefix: true,
	aliases: ['d'],
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['ign'],

	async execute(message) {
		if (!message.options.ign) return message.reply('Enter a player!');

		const player = await getPlayer(message.options.ign).catch((e) => {
			if (e.message.includes('Player does not exist.')) return message.reply('Invalid player!');
			if (e.message.includes('Player has never logged into Hypixel.')) return message.reply(`${message.options.ign} doesn't play Hypixel!`);
		});

		if (!player) return;

		const discord = await getDiscord(player);
		if (!discord) return message.reply(`${player.nickname}: No Discord found!`);

		message.reply(`@${discord}`);
	}
};
