import { getPlayer, getSkills } from '../../utils/utils.js';

export default {
	name: 'skills',
	prefix: true,
	aliases: ['skill'],
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['ign', 'profile'],

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

		let skills;
		if (message.options.profile === '-h') {
			skills = await getSkills.highest(player).catch((e) => {
				if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
			});
		}
		else {
			skills = await getSkills.current(player).catch((e) => {
				if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
			});
		}

		await message.reply(`${player.nickname}'s Skills: Comb ${skills.combat}, Farm ${skills.farming}, Fish ${skills.fishing}, Mine ${skills.mining}, Fora ${skills.foraging}, Ench ${skills.enchanting}, Alch ${skills.alchemy}, Tame ${skills.taming}, Carp ${skills.carpentry} | Skill Avg ${Math.floor(skills.skillAverage * 10) / 10}`);
	}
};
