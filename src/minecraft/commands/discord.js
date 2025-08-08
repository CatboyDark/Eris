import { getPlayer, InvalidPlayer } from '../../utils/utils.js';

export default {
	name: 'discord',
	prefix: true,
	aliases: ['d'],
	channels: ['guild', 'officer', 'party', 'dm'],
	options: ['ign'],

	async execute(message) {
		if (!message.options.ign) return message.reply('Enter a player!');

		let player;

		try {
			player = await getPlayer(message.options.ign);
		}
		catch (e) {
			if (e instanceof InvalidPlayer) return message.reply(`${message.options.ign}: Invalid player!`);
			else console.error('Error | MC command: discord', e);
		}

		if (!player.discord) return message.reply(`${player.ign}: No Discord found!`);

		message.reply(`@${player.discord}`);
	}
};
