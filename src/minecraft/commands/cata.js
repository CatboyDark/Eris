import { getCata, /* getPlayer,  */ getUser } from '../../utils/utils.js';

export default {
	name: 'cata',
	prefix: true,
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['ign', 'profile'],

	async execute(message) {
		// let player;

		// if (!message.options.ign) {
		// 	player = await getPlayer(message.sender);
		// }
		// else {
		// 	player = await getPlayer(message.options.ign).catch((e) => {
		// 		if (e.message.includes('Player does not exist.')) return message.reply('Invalid player!');
		// 		if (e.message.includes('Player has never logged into Hypixel.')) return message.reply(`${message.options.ign} doesn't play Hypixel!`);
		// 	});
		// }

		// if (!player) return;

		// let cata;
		// if (message.options.profile === '-h') {
		// 	cata = await getCata.highest(player).catch((e) => {
		// 		if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
		// 		console.log(e);
		// 	});
		// }
		// else {
		// 	cata = await getCata.current(player).catch((e) => {
		// 		if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
		// 		console.log(e);
		// 	});
		// }

		const user = message.options.ign ? message.options.ign : message.sender;
		const userData = await getUser(user);
		if (!userData) return message.reply('Invalid player!');

		let cata;
		if (message.options.profile === '-h') {
			cata = await getCata.highest(userData.id).catch((e) => {
				console.log(e);
			});
		}
		else {
			cata = await getCata.current(userData.id).catch((e) => {
				console.log(e);
			});
		}

		if (cata.secrets > 1000000) {
			cata.secrets = `${(cata.secrets / 1000000).toFixed(1)}M`;
		}
		else if (cata.secrets > 1000) {
			cata.secrets = `${Math.floor(cata.secrets / 1000)}k`;
		}

		await message.reply(`${userData.ign}: Cata ${cata.level} | Class Avg ${cata.classAvg} (➶${cata.archer}, ⚡${cata.mage}, ☄${cata.berserk}, ⚓${cata.tank}, ⚚${cata.healer}) | Secrets: ${cata.secrets} (${cata.spr} S/R)`);
	}
};
