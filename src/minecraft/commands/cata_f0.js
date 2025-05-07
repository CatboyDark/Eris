import { getCata, getUser } from '../../utils/utils.js';

export default {
	name: 'f0',
	prefix: true,
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['ign'],

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

		// const cata = await getCata.current(player, 'f0')
		// .catch((e) => {
		// 	if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
		// 	console.log(e);
		// });

		const user = message.options.ign ? message.options.ign : message.sender;
		const userData = await getUser(user);
		if (!userData) return message.reply('Invalid player!');

		let cata;
		if (message.options.profile === '-h') {
			cata = await getCata.highest(userData.id, 'm7').catch((e) => {
				console.log(e);
			});
		}
		else {
			cata = await getCata.current(userData.id, 'm7').catch((e) => {
				console.log(e);
			});
		}

		await message.reply(`${userData.ign}'s Entrance: Runs: ${cata.runs} | PB: ${cata.score} ${cata.time}`);
	}
};
