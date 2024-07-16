const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createMsg, createButtons } = require('../../../builder.js');

const startMsg = createMsg({
	description: 
		'## Getting Started\n' +
		'_ _\n' +
		'**Hello!** Thank you for using Eris.\n\n' +
		'This command edits the **config.json** file in your bot folder.\n' +
		'You can manually adjust these settings anytime.\n\n' +
		'Let\'s start by filling out the Required Configs for the bot to function.'
});

const startButtons = createButtons([
	{ id: 'configs', label: 'Configs', style: 'success' },
	{ id: 'features', label: 'Features', style: 'success' }
]);

module.exports = 
{
	type: 'slash',
	staff: true,
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Bot Setup')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
		
	async execute(interaction) 
	{
		await interaction.reply({ embeds: [startMsg], components: [startButtons] });
	}
};