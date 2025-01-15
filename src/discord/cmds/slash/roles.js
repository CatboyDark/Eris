import { createMsg } from '../../../helper/builder.js';
import { Link } from '../../../mongo/schemas.js';
import { getEmoji, getPlayer, updateRoles } from '../../../helper/utils.js';

export default
{
	name: 'roles',
	desc: 'Update your roles',

	async execute(interaction) 
	{
		await interaction.deferReply();
		const plus = await getEmoji('plus');
		const minus = await getEmoji('minus');

		try {
			const data = await Link.findOne({ dcid: interaction.user.id }).exec();
			if (!data) { return interaction.followUp({ embeds: [createMsg({ color: 'Red', desc: '**You are not linked! Please run /link to link your account!**' })], ephemeral: true }); }
			const uuid = data.uuid;
			const player = await getPlayer(uuid);

			try 
			{
				await interaction.member.setNickname(player.nickname);
			}
			catch (e) 
			{
				if (e.message.includes('Missing Permissions')) { interaction.followUp({ embeds: [createMsg({ color: 'FFD800', desc: '**I don\'t have permission to change your nickname!**' })] }); }
			}

			const { addedRoles, removedRoles } = await updateRoles(interaction.member, player);

			let desc;
			if (addedRoles.length > 0 && removedRoles.length > 0) 
			{
				desc = '**Your roles have been updated!**\n_ _\n';
				desc += `${addedRoles.map((roleId) => `${plus} <@&${roleId}>`).join('\n')}\n_ _\n`;
				desc += `${removedRoles.map((roleId) => `${minus} <@&${roleId}>`).join('\n')}`;
			}
			else if (addedRoles.length > 0) 
			{
				desc = '**Your roles have been updated!**\n_ _\n';
				desc += `${addedRoles.map((roleId) => `${plus} <@&${roleId}>`).join('\n')}\n_ _`;
			}
			else if (removedRoles.length > 0) 
			{
				desc = '**Your roles have been updated!**\n_ _\n';
				desc += `${removedRoles.map((roleId) => `${minus} <@&${roleId}>`).join('\n')}\n_ _`;
			}
			else
			{
				desc = '**Your roles are up to date!**';
			}

			return interaction.followUp({ embeds: [createMsg({ desc })] });
		}
		catch (error) 
		{
			console.log(error);
			throw error;
		}
	}
};
