import { getCata, getPlayer, getTheAccurateFuckingCataLevel } from '../../helper.js';

export default {
	name: 'cata',
	prefix: true,
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['ign'],

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

		const cata = await getCata.highest(player).catch((e) => {
			if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
			console.log(e);
		});

		if (!cata) return;

		const accurateCata = getTheAccurateFuckingCataLevel(cata.experience.level, cata.experience.xp);

		const healer = cata.classes.healer.level;
		const mage = cata.classes.mage.level;
		const berserk = cata.classes.berserk.level;
		const archer = cata.classes.archer.level;
		const tank = cata.classes.tank.level;
		const classAvg = (healer + mage + berserk + archer + tank) / 5;

		const secrets = cata.secrets.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		const spr = parseFloat((cata.secrets / (cata.completions.catacombs.total + cata.completions.masterCatacombs.total)).toFixed(2));

		await message.reply(`${player.nickname}: Cata ${accurateCata} | Class Avg ${classAvg} (A${archer}, M${mage}, B${berserk}, T${tank}, H${healer}) | Secrets ${secrets} (${spr} S/R)`);
	}
};
