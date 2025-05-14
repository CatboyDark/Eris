import { getPlayer, getGuild, getUser } from '../../utils/utils.js';

export default {
	name: 'guildextras',
	prefix: true,
	aliases: ['ge'],
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['entry', 'args'],

	async execute(message) {

		if (message.options.args === '-g') {
			const guild = await getGuild.name(message.options.entry);

			const guildMaster = await getUser(guild.members.find(member => member.rank === 'Guild Master').uuid);
			return message.reply(`${guild.name}: Level: ${Number(Math.floor(guild.level.toFixed(1)))} | GM: ${guildMaster.ign} | Members: ${guild.members.length}/125 | Weekly GXP: ${format(guild.totalWeeklyGexp.toFixed(1))} `);
		}

		const player = await getPlayer(message.options.entry ? message.options.entry : message.sender).catch((e) => {
			if (e.message.includes('Player does not exist.')) return message.reply('Invalid player!');
			if (e.message.includes('Player has never logged into Hypixel.')) return message.reply(`${message.options.ign} doesn't play Hypixel!`);
		});

		if (!player) return;

		const guild = await getGuild.player(player.nickname);
		if (!guild) return message.reply(`${player.nickname} is not in a guild.`);

		const member = guild.members.find(member => member.uuid === player.uuid);
		const playerWeeklyGXP = member.weeklyExperience > 1000 ? `${member.weeklyExperience / 1000}k` : member.weeklyExperience;
		const guildMaster = await getUser(guild.members.find(member => member.rank === 'Guild Master').uuid);

		message.reply(`${player.nickname}: ${guild.name} | Weekly GXP: ${playerWeeklyGXP}`);
		message.reply(`${guild.name}: Level: ${Number(Math.floor(guild.level.toFixed(1)))} | GM: ${guildMaster.ign} | Members: ${guild.members.length}/125 | Weekly GXP: ${format(guild.totalWeeklyGexp.toFixed(1))} `);
	}
};

function format(value) {
	if (value >= 1e12) return (Math.floor(value / 1e10) / 100).toFixed(2) + 'T';
	if (value >= 1e9) return (Math.floor(value / 1e8) / 10).toFixed(1) + 'B';
	if (value >= 1e6) return Math.floor(value / 1e6) + 'M';
	if (value >= 1e3) return Math.floor(value / 1e3) + 'k';
	return Math.floor(value.toString());
}
