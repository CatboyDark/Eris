import { getNw, getPlayer } from '../../helper.js';

export default {
	name: 'networth',
	prefix: true,
	aliases: ['nw'],
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['ign', 'profile'],

	async execute(message) {
		let player;

		if (!message.options.ign) {
			player = await getPlayer(message.sender);
		}
		else {
			player = await getPlayer(message.options.ign).catch((e) => {
				if (e.message.includes('Player does not exist.')) return message.reply('Invalid IGN!');
				if (e.message.includes('Player has never logged into Hypixel.')) return message.reply(`${message.options.ign} doesn't play Hypixel!`);
			});
		}

		if (!player) return;

		let nw;
		if (message.options.profile === '-h') {
			nw = await getNw.highest(player).catch((e) => {
				if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
			});
		}
		else {
			nw = await getNw.current(player).catch((e) => {
				if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
			});
		}

		if (!nw) return;

		message.reply(`${player.nickname}'s Networth: ${nw.networth} | Purse: ${nw.purse} | Bank: ${nw.bank}`);
	}
};
