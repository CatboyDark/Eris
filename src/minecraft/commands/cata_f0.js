import { getCata, getPlayer } from '../../helper.js';

export default {
	name: 'f0',
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
				if (e.message.includes('Player does not exist.')) return message.reply('Invalid player!');
				if (e.message.includes('Player has never logged into Hypixel.')) return message.reply(`${message.options.ign} doesn't play Hypixel!`);
			});
		}

		if (!player) return;

		const cata = await getCata.current(player, 'f0')
		.catch((e) => {
			if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
			console.log(e);
		});

		await message.reply(`${player.nickname}'s Entrance: ${cata.runs} Runs`);
		// await message.reply(`${player.nickname}'s Entrance: ${cata.runs} Runs | PB: ${cata.score} ${cata.time}`);
	}
};
