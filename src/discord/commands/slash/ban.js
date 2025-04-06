// import { MessageFlags } from 'discord.js';
// import { createMsg, getPerms } from '../../../utils/utils.js';

// export default {
// 	name: 'ban',
// 	desc: 'Ban member',
// 	options: [
// 		{ type: 'user', name: 'user', desc: 'User', required: true },
// 		{ type: 'string', name: 'reason', desc: 'Reason', required: true }
// 	],

// 	async execute(interaction) {
// 		const perms = getPerms(interaction.member);
// 		if (!perms.includes('BanMembers')) return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**You don\'t have permission to use this command!**' })], flags: MessageFlags.Ephemeral });

// 		const user = interaction.options.getUser('user');
// 		const member = interaction.guild.members.cache.get(user.id);
//         const reason = interaction.options.getString('reason');

// 		try {
//             await member.timeout(muteDuration, reason);
//             interaction.reply({ embeds: [createMsg({ desc: `**<@${user.id}> has been muted for ${lengthExtended}!**` })], flags: MessageFlags.Ephemeral });
//         }
// 		catch (e) {
// 			console.log(e);
// 		}
// 	}
// };
