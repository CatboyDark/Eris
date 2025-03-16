import { getCata, getPlayer } from '../../helper.js';
import { getPB } from './cata_f0.js';

export default {
	name: 'm6',
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

		const cata = await getCata.current(player).catch((e) => {
			if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
			console.log(e);
		});

		if (!cata) return;

		const runs = cata.completions.masterCatacombs.Floor_6;
		if (!runs) {
			return message.reply(`${player.nickname} hasn't played M6!`);
		}

		const pb = getPB(cata, 'masterCatacombs6');
		if (!pb) {
			return message.reply(`${player.nickname} hasn't played M6!`);
		}

		const collection = cata.completions.catacombs.Floor_6 + (cata.completions.masterCatacombs.Floor_6 * 2);

		await message.reply(`${player.nickname}'s M6: ${runs} Runs | PB ${pb.score}: ${pb.time} | Total Collection: ${collection}`);
	}
};
