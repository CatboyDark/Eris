const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createMsg } = require('../../../helper/builder.js');
	
module.exports =
{
	type: 'slash',
	staff: true,
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Add or remove a user\'s roles')
		.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true))
		.addRoleOption(option => option.setName('role').setDescription('Select a role').setRequired(true))
		.addRoleOption(option => option.setName('role_').setDescription('Select a role').setRequired(false))
		.addRoleOption(option => option.setName('role__').setDescription('Select a role').setRequired(false))
		.addRoleOption(option => option.setName('role___').setDescription('Select a role').setRequired(false))
		.addRoleOption(option => option.setName('role____').setDescription('Select a role').setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

	async execute(interaction) 
	{
		await interaction.deferReply();

		const user = interaction.options.getMember('user');
		const roles = [
			interaction.options.getRole('role'),
			interaction.options.getRole('role_'),
			interaction.options.getRole('role__'),
			interaction.options.getRole('role___'),
			interaction.options.getRole('role____'),
			interaction.options.getRole('role_____')
		].filter(role => role);

		const uniqueRoles = Array.from(new Set(roles.map(role => role.id))).map(id => roles.find(role => role.id === id));
		const noPerms = uniqueRoles.filter(role => role.managed || interaction.member.roles.highest.comparePositionTo(role) <= 0);
		const validRoles = uniqueRoles.filter(role => !noPerms.includes(role));
		
		if (noPerms.length > 0)
		{
			const noPermRoles = noPerms.map(role => `- <@&${role.id}>`).join('\n');
			await interaction.followUp({ embeds: [createMsg({ color: 'FF0000', desc: `**You do not have permission to manage these roles:**\n\n${noPermRoles}` })] });
		}

		const roleAdd = validRoles.filter(role => !user.roles.cache.has(role.id));
		const roleRemove = validRoles.filter(role => user.roles.cache.has(role.id));

		if (roleRemove.length > 0) await user.roles.remove(roleRemove);
		if (roleAdd.length > 0) await user.roles.add(roleAdd);

		if (roleAdd.length > 0 || roleRemove.length > 0) 
		{
			const addedRoles = roleAdd.map(role => `+ <@&${role.id}>`).join('\n');
			const removedRoles = roleRemove.map(role => `- <@&${role.id}>`).join('\n');
			const desc = [addedRoles, removedRoles].filter(Boolean).join('\n');

			const embed = createMsg({ desc: `${user} **Updated roles!**\n\n${desc}` });
			await interaction.followUp({ embeds: [embed] });
		}
	}
};
