import { getPlayer, getGuild } from '../../helper.js';

export default {
	name: 'guild',
	prefix: true,
	aliases: ['g'],
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['player'],

	async execute(message) {
		if (!message.options.player) return message.reply('Enter a player!');

		const player = await getPlayer(message.options.player).catch((e) => {
			if (e.message.includes('Player does not exist.')) return message.reply('Invalid IGN!');
			if (e.message.includes('Player has never logged into Hypixel.')) return message.reply(`${message.options.ign} doesn't play Hypixel!`);
		});

		const guild = await getGuild.player(player.nickname);
		if (!guild) return message.reply(`${player.nickname} is not in a guild.`);

		const member = guild.members.find(member => member.uuid === player.uuid);
		const playerWeeklyGXP = member.weeklyExperience > 1000 ? `${member.weeklyExperience / 1000}k` : member.weeklyExperience;

		message.reply(`${player.nickname}: ${guild.name} | Weekly GXP: ${playerWeeklyGXP}`);
	}
};
