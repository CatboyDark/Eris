import { getSkyblock, getUser, HypixelNoSkyblockData, InvalidPlayer } from '../../utils/utils.js';

export default {
	name: 'kuudra',
	prefix: true,
	channels: ['guild', 'officer', 'party', 'dm'],
	options: ['ign', 'profile'],

	async execute(message) {
		let user;
		if (message.options.ign) {
			try {
				user = await getUser(message.options.ign);
			}
			catch (e) {
				if (e instanceof InvalidPlayer) return message.reply(`${message.options.ign}: Invalid player!`);
				else console.error('Error | MCcommand: level', e);
			}
		}
		else {
			user = await getUser(message.sender);
		}

		let player;
		try {
			player = await getSkyblock(user.id, { profile: message.options.profile });
		}
		catch (e) {
			if (e instanceof HypixelNoSkyblockData) return message.reply(`${user.ign} has never played Skyblock!`);
			else console.error('Error | MCcommand: level', e);
		}

		const kuudra = player.kuudra;

		message.reply(`${user.ign}'s Kuudra: T1: ${kuudra.k1} | T2: ${kuudra.k2} | T3: ${kuudra.k3} | T4: ${kuudra.k4} | T5: ${kuudra.k5} | Highest Wave: ${kuudra.highest.tier} ${kuudra.highest.waves}`);
	}
};
