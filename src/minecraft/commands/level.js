import { getPlayer, getSBLevel } from '../../utils/utils.js';

export default {
	name: 'level',
	prefix: true,
	aliases: ['l', 'lv'],
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['ign', 'profile'],

	async execute(message) {
		let player;

		if (!message.options.ign) {
			player = await getPlayer(message.sender);
		}
		else {
			player = await getPlayer(message.options.ign).catch((e) => {
				if (e.message.includes('Player does not exist.')) return message.reply('Invalid player!');
				if (e.message.includes('Player has never logged into Hypixel.')) return message.reply(`${message.options.ign} doesn't play Hypixel!`);
			});
		}

		if (!player) return;

		let level;
		if (message.options.profile === '-h') {
			level = await getSBLevel.highest(player).catch((e) => {
				if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
			});
		}
		else {
			level = await getSBLevel.current(player).catch((e) => {
				if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
			});
		}

		let progress = Math.round((level % 1) * 100);
		progress = progress > 0? ` (${progress}/100)` : '';

		message.reply(`${player.nickname}: Level ${Math.floor(level)}${progress}`);
	}
};
