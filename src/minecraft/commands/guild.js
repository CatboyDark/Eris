import { getPlayer, getGuild } from '../../helper.js';

export default {
	name: 'guild',
	prefix: true,
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['arg'],

	async execute(message) {
		const player = await getPlayer(message.options.arg).catch((e) => {
			if (e.message.includes('Player does not exist.')) return message.reply('Invalid IGN!');
			if (e.message.includes('Player has never logged into Hypixel.')) return message.reply(`${message.options.ign} doesn't play Hypixel!`);
		});

		if (!player) return;

		const guild = await getGuild.player(player.nickname);
		if (!guild) return message.reply(`${player.nickname} is not in a guild.`);

		const member = guild.members.find(member => member.uuid === player.uuid);
		const playerWeeklyGXP = member.weeklyExperience > 1000 ? `${member.weeklyExperience / 1000}k` : member.weeklyExperience;

		message.reply(`${player.nickname}: ${guild.name} | Weekly GXP: ${playerWeeklyGXP}`);
	}
};
