const { SlashCommandBuilder } = require('discord.js');
const { createCommandDataMsg, dataButtons } = require('../../logic/data.js');

module.exports = 
{
	type: 'slash',
	staff: true,
	data: new SlashCommandBuilder()
		.setName('data')
		.setDescription('Display bot data'),
		
	async execute(interaction) 
	{
		const embed = await createCommandDataMsg();
		await interaction.reply({ embeds: [embed], components: [dataButtons] });
	}
};
