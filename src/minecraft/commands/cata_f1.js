import { getCata, getUser } from '../../utils/utils.js';

export default {
	name: 'f1',
	prefix: true,
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['ign'],

	async execute(message) {
		const user = message.options.ign ? message.options.ign : message.sender;
		const userData = await getUser(user);
		if (!userData) return message.reply('Invalid player!');

		let cata;
		if (message.options.profile === '-h') {
			cata = await getCata.highest(userData.id, 'f1').catch((e) => {
				console.log(e);
			});
		}
		else {
			cata = await getCata.current(userData.id, 'f1').catch((e) => {
				console.log(e);
			});
		}

		await message.reply(`${userData.ign}'s F1 PB: ${cata.score} ${cata.time} | Runs: ${cata.runs} | Total Collection: ${cata.collection}`);
	}
};
