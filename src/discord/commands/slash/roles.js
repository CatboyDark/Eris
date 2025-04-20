import { MessageFlags } from 'discord.js';
import { getMongo, membersSchema } from '../../../mongo/schemas.js';
import { createMsg, getEmoji, getPlayer, updateRoles } from '../../../utils/utils.js';

export default {
	name: 'roles',
	desc: 'Update your nick and roles',

	async execute(interaction) {
		interaction.deferReply();

		const check = await getEmoji('check');
		const plus = await getEmoji('plus');
		const minus = await getEmoji('minus');

		const members = getMongo('Eris', 'members', membersSchema);
		const data = await members.findOne({ dcid: interaction.user.id });
		if (!data) {
			return interaction.editReply({ embeds: [createMsg({ color: 'Red', desc: '**You are not linked! Please run /link to link your account!**' })], flags: MessageFlags.Ephemeral });
		}
		const uuid = data.uuid;
		const player = await getPlayer(uuid);

		let nickError = false;
		await interaction.member.setNickname(player.nickname).catch((e) => {
			if (e.message.includes('Missing Permissions')) {
				interaction.editReply({ embeds: [createMsg({ color: 'FFD800', desc: '**I don\'t have permission to change your nickname!**' })] });
				nickError = true;
			}
		});

		const { addedRoles, removedRoles } = await updateRoles(interaction.member, player);

		let desc;
		if (addedRoles.length > 0 && removedRoles.length > 0) {
			desc = `${check} **Your roles have been updated!**\n_ _\n`;
			desc += `${addedRoles.map((roleId) => `${plus} <@&${roleId}>`).join('\n')}\n_ _\n`;
			desc += `${removedRoles.map((roleId) => `${minus} <@&${roleId}>`).join('\n')}`;
		}
		else if (addedRoles.length > 0) {
			desc = `${check} **Your roles have been updated!**\n_ _\n`;
			desc += `${addedRoles.map((roleId) => `${plus} <@&${roleId}>`).join('\n')}\n_ _`;
		}
		else if (removedRoles.length > 0) {
			desc = `${check} **Your roles have been updated!**\n_ _\n`;
			desc += `${removedRoles.map((roleId) => `${minus} <@&${roleId}>`).join('\n')}\n_ _`;
		}
		else {
			desc = `${check} **Your roles are up to date!**`;
		}

		if (nickError) {
			interaction.followUp({ embeds: [createMsg({ desc: desc })] });
		}
		else {
			interaction.editReply({ embeds: [createMsg({ desc: desc })] });
		}
	}
};
