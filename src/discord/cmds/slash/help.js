const { SlashCommandBuilder } = require('discord.js');
const { createHelpMsg, helpButtons } = require('../../logic/help.js');

module.exports = 
{
	type: 'slash',
	staff: false,
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Show bot info'),
		
	async execute(interaction) 
	{
		await interaction.reply({ embeds: [createHelpMsg(interaction)], components: [helpButtons] });
	}
};
