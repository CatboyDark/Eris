import { getSkyblock, getUser, HypixelNoSkyblockData, InvalidPlayer } from '../../utils/utils.js';

export default {
	name: 'level',
	prefix: true,
	aliases: ['l', 'lv', 'lvl'],
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
			}
		}
		else {
			user = await getUser(message.sender);
		}

		let player;
		try {
			player = await getSkyblock(user.id, message.options.profile);
		}
		catch (e) {
			if (e instanceof HypixelNoSkyblockData) return message.reply(`${user.ign} has never played Skyblock!`);
		}

		const level = player.level;
		const progress = Number.isInteger(level) ? '' : ` (${Math.round((level % 1) * 100)}/100)`;

		message.reply(`${user.ign}: Level ${Math.floor(level)}${progress}`);
	}
};
