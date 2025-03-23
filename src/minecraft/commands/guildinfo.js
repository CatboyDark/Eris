import { getPlayer, getGuild, getUser, nFormat } from '../../helper.js';
import fs from 'fs';

export default {
	name: 'guildinfo',
	prefix: true,
	aliases: ['gi'],
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['guild'],

	async execute(message) {
		let guild;

		if (!message.options.guild) {
			const player = await getPlayer(message.sender);
			guild = await getGuild.player(player.nickname);
		}
		else {
			guild = await getGuild.name(message.options.guild);
		}

		fs.writeFileSync('./test.json', JSON.stringify(guild, null, '\t'), 'utf8');

		const guildMaster = await getUser(guild.members.find(member => member.rank === 'Guild Master').uuid);
		message.reply(`${guild.name}: Level: ${Number(Math.floor(guild.level.toFixed(1)))} | GM: ${guildMaster.name} | Members: ${guild.members.length}/125 | Weekly GXP: ${nFormat(guild.totalWeeklyGexp.toFixed(1))} `);
	}
};
