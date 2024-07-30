const { SlashCommandBuilder } = require('discord.js');
const { createHelpMsg, helpButtons } = require('../../logic/help.js');

module.exports = 
{
	type: 'slash',
	staff: false,
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Display bot info'),
		
	async execute(interaction) 
	{
		const embed = await createHelpMsg(interaction);
		await interaction.reply({ embeds: [embed], components: [helpButtons] });
	}
};
