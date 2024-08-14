const { createMsg, createSlash } = require('../../../helper/builder.js');
const db = require('../../../mongo/schemas.js');
const { getEmoji, getPlayer, updateRoles } = require('../../../helper/utils.js');

module.exports = createSlash({
	name: 'roles',
	desc: 'Update your roles',

	async execute(interaction) 
	{
		await interaction.deferReply();

		const user = interaction.user.id;
		const plus = await getEmoji('plus');
		const minus = await getEmoji('minus');

		try 
		{
			const data = await db.Link.findOne({ dcid: user }).exec();
			const uuid = data.uuid;
			const player = await getPlayer(uuid);

			try 
			{
				await interaction.member.setNickname(player.nickname);
			} 
			catch (e) 
			{
				if (e.message.includes('Missing Permissions')) 
					interaction.followUp({ embeds: [createMsg({ color: 'FFA500', desc: '**Silly! I cannot change the nickname of the server owner!**' })]});
			}

			const { addedRoles, removedRoles } = await updateRoles(interaction, player);

			let desc;
			if (addedRoles.length > 0 && removedRoles.length > 0) 
			{
				desc = '**Your roles have been updated!**\n_ _\n';
				desc += `${addedRoles.map(roleId => `${plus} <@&${roleId}>`).join('\n')}\n_ _\n`;
				desc += `${removedRoles.map(roleId => `${minus} <@&${roleId}>`).join('\n')}`;
			} 
			else if (addedRoles.length > 0) 
			{
				desc = '**Your roles have been updated!**\n_ _\n';
				desc += `${addedRoles.map(roleId => `${plus} <@&${roleId}>`).join('\n')}\n_ _`;
			} 
			else if (removedRoles.length > 0) 
			{
				desc = '**Your roles have been updated!**\n_ _\n';
				desc += `${removedRoles.map(roleId => `${minus} <@&${roleId}>`).join('\n')}\n_ _`;
			} 
			else 
			{
				desc = '**Your roles are up to date!**';
			}

			return interaction.followUp({ embeds: [createMsg({ desc: desc })] });
		} 
		catch (error) 
		{
			throw error;
		}
	}
});
