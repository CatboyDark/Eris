import { getCata, getPlayer } from '../../utils/utils.js';

export default {
	name: 'cata',
	prefix: true,
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

		let cata;
		if (message.options.profile === '-h') {
			cata = await getCata.highest(player).catch((e) => {
				if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
				console.log(e);
			});
		}
		else {
			cata = await getCata.current(player).catch((e) => {
				if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
				console.log(e);
			});
		}

		await message.reply(`${player.nickname}'s Cata: ${cata.level} | Class Avg ${cata.classAvg} (A${cata.archer}, M${cata.mage}, B${cata.berserk}, T${cata.tank}, H${cata.healer}) | Secrets ${cata.secrets} (${cata.spr} S/R)`);
	}
};
