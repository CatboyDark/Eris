import { MessageFlags } from 'discord.js';
import { createMsg, getDiscord, getEmoji, getPlayer, updateRoles } from '../../../helper.js';
import { getMongo, membersSchema } from '../../../mongo/schemas.js';

export default
{
	name: 'link',
	desc: 'Link your account',
	options: [
		{ type: 'string', name: 'ign', desc: 'Enter your IGN', required: true }
	],

	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			const ign = interaction.options.getString('ign');
			const player = await getPlayer(ign);
			const discord = await getDiscord(ign);

			const check = await getEmoji('check');
			const plus = await getEmoji('plus');
			const minus = await getEmoji('minus');

			if (!discord) return interaction.editReply({ embeds: [createMsg({ color: 'Red', desc: '**Discord is not linked!**' })] });
			if (interaction.user.username !== discord.toLowerCase()) return interaction.editReply({ embeds: [createMsg({ color: 'Red', desc: '**Discord does not match!**'  })] });

			const members = getMongo('Eris', 'members', membersSchema);
			members.findOneAndUpdate(
				{ $or: [{ uuid: player.uuid }, { dcid: interaction.user.id }] },
				{ uuid: player.uuid, dcid: interaction.user.id },
				{ upsert: true, new: true }
			);

			let nickError = false;
			await interaction.member.setNickname(player.nickname).catch((e) => {
				if (e.message.includes('Missing Permissions')) {
					interaction.editReply({ embeds: [createMsg({ color: 'FFD800', desc: '**I don\'t have permission to change your nickname!**' })] });
					nickError = true;
				}
			});

			const { addedRoles, removedRoles } = await updateRoles(interaction.member, player);

			let desc = `${check} **Account linked!**`;
			if (addedRoles.length > 0 && removedRoles.length > 0) {
				desc += `\n_ _\n${addedRoles.map((roleID) => `${plus} <@&${roleID}>`).join('\n')}`;
				desc += `\n_ _\n${removedRoles.map((roleID) => `${minus} <@&${roleID}>`).join('\n')}`;
			}
			else if (addedRoles.length > 0) {
				desc += `\n_ _\n${addedRoles.map((roleID) => `${plus} <@&${roleID}>`).join('\n')}\n_ _`;
			}
			else if (removedRoles.length > 0) {
				desc += `\n_ _\n${removedRoles.map((roleID) => `${minus} <@&${roleID}>`).join('\n')}\n_ _`;
			}

			if (nickError) {
				interaction.followUp({ embeds: [createMsg({ desc: desc })], flags: MessageFlags.Ephemeral });
			}
			else {
				interaction.editReply({ embeds: [createMsg({ desc: desc })] });
			}
		}
		catch (e) {
			if (e.message.includes('Player does not exist')) return interaction.editReply({ embeds: [createMsg({ color: 'Red', desc: '**Invalid Username!**' })] });
			if (e.message.includes('Missing Permissions')) return interaction.editReply({ embeds: [createMsg({ color: 'FFD800', desc: '**I don\'t have permission to assign your roles!**\n\n-# I must have a role higher than the ones I\'m assigning.' })] });
			console.log(e);
		}
	}
};
