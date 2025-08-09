import { config, getGuild, getUser, HypixelInvalidGuild } from '../../utils/utils.js';

export default {
	name: 'guildinfo',
	prefix: true,
	aliases: ['gi'],
	channels: ['guild', 'officer', 'party', 'dm'],
	options: ['guild'],

	async execute(message) {
		let guild;
		if (message.options.guild) {
			try {
				guild = await getGuild.name(message.options.guild);
			}
			catch (e) {
				if (e instanceof HypixelInvalidGuild) return message.reply(`${message.options.guild}: Invalid guild name! (For names with spaces, use quotes: ${config.prefix}guild 'Creators Club')`);
				else console.error('Error | MC command: guildinfo', e);
			}
		}
		else {
			const user = await getUser(message.sender);
			guild = await getGuild.player(user.id);
		}

		const level = Math.floor1(guild.level);
		const guildMaster = await getUser(guild.members.find(member => member.rank === 'Guild Master').uuid);

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
