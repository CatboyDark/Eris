const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createMsg, createRow } = require('../../../builder.js');

const startMsg = createMsg({
	title: 'Getting Started',
	desc: 
		'**Hello!** Thank you for using Eris.\n\n' +
		'This command edits the **config.json** file in your bot folder.\n' +
		'You can manually adjust these settings anytime.\n\n' +
		'Let\'s start by filling out the required Configs for the bot to function.'
});

const startButtons = createRow([
	{ id: 'configs', label: 'Configs', style: 'Green' },
	{ id: 'features', label: 'Features', style: 'Green' },
	{ id: 'logging', label: 'Logging', style: 'Blue' }
]);

module.exports = 
{
	startMsg,
	startButtons,
	
	type: 'slash',
	staff: true,
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Bot setup (Requires Manage Server Permission)')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
		
	async execute(interaction) 
	{
		await interaction.reply({ embeds: [startMsg], components: [startButtons], ephemeral: true });
	}
};