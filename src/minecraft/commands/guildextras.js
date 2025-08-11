import { getGuild, getUser, InvalidPlayer } from '../../utils/utils.js';

export default {
	name: 'guildextras',
	prefix: true,
	aliases: ['ge', 'guildextra'],
	channels: ['guild', 'officer', 'party', 'dm'],
	options: ['ign'],

	async execute(message) {
		let user;
		if (message.options.ign) {
			try {
				user = await getUser(message.options.ign);
			}
			catch (e) {
				if (e instanceof InvalidPlayer) return message.reply(`${message.options.ign}: Invalid player!`);
				else console.error('Error | MC command: guildextra', e);
			}
		}
		else {
			user = await getUser(message.sender);
		}

		const guild = await getGuild.player(user.id);
		if (!guild) return message.reply(`${message.options.ign} isn't in a guild!`);

		const member = guild.members.find(member => member.uuid === user.id);
		const level = Math.floor1(guild.level);
		const guildMaster = await getUser(guild.members.find(member => member.rank === 'Guild Master').uuid);

		message.reply(`${user.ign}: ${guild.name} | Weekly GXP: ${format(member.weeklyGXP)}`);
		message.reply(`${guild.name}: Level ${level} | GM: ${guildMaster.ign} | Members: ${guild.members.length} | Weekly GXP: ${format(guild.weeklyGXP)}`);
	}
};

function format(value) {
	if (value >= 1e12) return Math.floor2(value / 1e12) + 'T';
	if (value >= 1e9) return Math.floor2(value / 1e9) + 'B';
	if (value >= 1e6) return Math.floor(value / 1e6) + 'M';
	if (value >= 1e3) return Math.floor(value / 1e3) + 'k';
	return Math.floor(value);
}
