const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { colorTheme } = require('../../../../config.json');
const fs = require('fs');

fs.existsSync('data.json') ? JSON.parse(fs.readFileSync('data.json', 'utf8')) : {};

const startMsg = new EmbedBuilder().setColor(colorTheme).setDescription
(
	'## Getting Started\n' +
	'_ _\n' +
	'**Hello!** Thank you for using Eris.\n\n' +
	'This command edits the **config.json** file in your bot folder.\n' +
	'You can manually adjust these settings anytime.\n\n' +
	'Let\'s start by filling out the Required Configs for the bot to function.'
);

const startButtons = new ActionRowBuilder().addComponents(
	new ButtonBuilder().setCustomId('configs').setLabel('Configs').setStyle(ButtonStyle.Success),
	new ButtonBuilder().setCustomId('features').setLabel('Features').setStyle(ButtonStyle.Success)
);

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