import { getSlayers, getPlayer } from '../../utils/utils.js';

export default {
	name: 'slayers',
	prefix: true,
	aliases: ['slayer'],
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

		let slayers;
		if (message.options.profile === '-h') {
			cata = await getSlayers.highest(player).catch((e) => {
				if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
				console.log(e);
			});
		}
		else {
			cata = await getSlayers.current(player).catch((e) => {
				if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
				console.log(e);
			});
		}

		await message.reply(`${player.nickname}'s Slayers: ௐ${slayers.levelRevs} ੭${slayers.levelTarans} ❂${slayers.levelWolves} ᛃ${slayers.levelEnders} 〣${slayers.levelBlazes} ჶ${slayers.levelVamps} Total Slayer XP:${slayers.totalXP}`);
	}
};
