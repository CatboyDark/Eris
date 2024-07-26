const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createMsg } = require('../../../helper/builder.js');
	
module.exports =
	{
		type: 'slash',
		data: new SlashCommandBuilder()
			.setName('role')
			.setDescription('Add or remove a user\'s roles')
			.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true))
			.addRoleOption(option => option.setName('role').setDescription('Select a role').setRequired(true))
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	
		async execute(interaction) 
		{
			const user = interaction.options.getMember('user');
			const role = interaction.options.getRole('role');
	
			if (interaction.member.roles.highest.comparePositionTo(role) <= 0) 
			{
				if (user.roles.cache.has(role.id)) 
				{  
					interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**You do not have permission to remove this role.**' })]}); 
				}
				else 
				{  
					interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**You do not have permission to assign this role.**' })] });
				}
			}
	
			if (user.roles.cache.has(role.id)) 
			{
				user.roles.remove(role);
				await interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: `**${user} is no longer ${role}.**` })] });
			} 
			else 
			{
				user.roles.add(role);
				await interaction.reply({ embeds: [createMsg({ color: '00FF00', desc: `**${user} is now ${role}.**` })] });
			}
		}
	};
	