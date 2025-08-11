import { getSkyblock, getUser, HypixelNoSkyblockData, InvalidPlayer } from '../../utils/utils.js';

export default {
	name: 'slayers',
	prefix: true,
	aliases: ['slayer'],
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

		const slayers = player.slayers;

		message.reply(`${user.ign}: Zombie ${slayers.zombie.level} | Spider ${slayers.spider.level} | Wolf ${slayers.wolf.level} | Enderman ${slayers.ender.level} | Blaze ${slayers.blaze.level} | Vampire ${slayers.vampire.level}`);
	}
};
