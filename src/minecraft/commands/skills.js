import { getSkyblock, getUser, InvalidPlayer } from '../../utils/utils.js';

export default {
	name: 'skills',
	prefix: true,
	channels: ['guild', 'officer', 'party', 'dm'],
	options: ['ign', 'profile'],
	aliases: ['skill'],

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

		const skills = {};
		for (const [key, value] of Object.entries(player.skills)) {
			skills[key] = Math.floor1(value);
		}

		message.reply(`${user.ign}: Comb ${skills.combat} | Farm ${skills.farming} | Fish ${skills.fishing} | Mine ${skills.mining} | Fora ${skills.foraging} | Ench ${skills.enchanting} | Alch ${skills.alchemy} | Tame ${skills.taming} | Carp ${skills.carpentry} | Skill Avg ${skills.average}`);
	}
};
