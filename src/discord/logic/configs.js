const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, ModalBuilder } = require('discord.js');
const { colorTheme } = require('../../../config.json');
const fs = require('fs');
const data = fs.existsSync('config.json') ? JSON.parse(fs.readFileSync('config.json', 'utf8')) : {};

const startMsg = new EmbedBuilder().setColor(colorTheme).setDescription
(
	'## Getting Started\n\n' +
	'**Hello!** Thank you for using Eris!\n\n' +
	'This command edits the **config.json** file in your bot folder.\n' +
	'You can manually adjust these settings anytime.\n\n' +
	'Let\'s start by filling out the Configs for the bot to function.'
);

const startButtons = new ActionRowBuilder().addComponents(
	new ButtonBuilder().setCustomId('configs').setLabel('Configs').setStyle(ButtonStyle.Success),
	new ButtonBuilder().setCustomId('features').setLabel('Features').setStyle(ButtonStyle.Success)
);

const configsEmbeds =
[
	new EmbedBuilder().setColor(colorTheme).setDescription(
		'### Guild\n*Required*\n\n' +
        'Enter your EXACT guild name.\n\n' +
        '*Note: wristspasm ≠ WristSpasm*'
	),
	new EmbedBuilder().setColor(colorTheme).setDescription(
		'### Server ID\n*Required*\n\n' +
        'Enter your Discord server ID.'
	),
	new EmbedBuilder().setColor(colorTheme).setDescription(
		'### Staff Roles\n*Required*\n\n' +
		'Enter your staff role IDs.\n' +
		'If you have more than one staff role, seperate them using a space.\n\n' +
		'*Note: Staff will be able to:*\n' +
		'- *Delete messages*\n' +
		'- *Assign roles below their own role*'
	),
	new EmbedBuilder().setColor(colorTheme).setDescription(
		'### Guild Icon\n*Optional*\n\n' +
		'Link an image of your guild icon. If you don\'t, a default will be provided.'
	),
	new EmbedBuilder().setColor(colorTheme).setDescription(
		'### Color Theme\n*Optional*\n\n' +
		'Enter a 6 digit HEX.\n' +
		'This will be used as the main bot color.'
	),
	new EmbedBuilder().setColor(colorTheme).setDescription(
		'### Yay! Your bot is now functional!\n' +
		'Next, why don\'t you check out some features?'
	)
];

function configsButtons(index)
{
	const buttons = new ActionRowBuilder();

	buttons.addComponents(new ButtonBuilder()
		.setCustomId('back')
		.setLabel('<')
		.setStyle(ButtonStyle.Success)
	);

	if (index === 0)
	{
		buttons.addComponents(new ButtonBuilder()
			.setCustomId('setGuild')
			.setLabel('Guild')
			.setStyle(ButtonStyle.Primary)
		);
	}

	if (index === 1)
	{
		buttons.addComponents(new ButtonBuilder()
			.setCustomId('setServerID')
			.setLabel('Server ID')
			.setStyle(ButtonStyle.Primary)
		);
	}

	if (index === 2)
	{
		buttons.addComponents(new ButtonBuilder()
			.setCustomId('setStaffRole')
			.setLabel('Staff Role(s)')
			.setStyle(ButtonStyle.Primary)
		);
	}

	if (index === 3)
	{
		buttons.addComponents(new ButtonBuilder()
			.setCustomId('setGuildIcon')
			.setLabel('Guild Icon')
			.setStyle(ButtonStyle.Primary)
		);
	}

	if (index === 4)
	{
		buttons.addComponents(new ButtonBuilder()
			.setCustomId('setColorTheme')
			.setLabel('Color Theme')
			.setStyle(ButtonStyle.Primary)
		);
	}

	if (index < configsEmbeds.length - 1)
	{
		buttons.addComponents(new ButtonBuilder()
			.setCustomId('next')
			.setLabel('>')
			.setStyle(ButtonStyle.Success)
		);
	}

	if (index === configsEmbeds.length - 1)
	{
		buttons.addComponents(new ButtonBuilder()
			.setCustomId('features')
			.setLabel('Features')
			.setStyle(ButtonStyle.Primary)
		);
	}

	return buttons;
}

const configsState = {
	index: 0
};

async function configs(interaction)
{
	configsState.index = 0;
	const buttons = configsButtons(configsState.index);
	await interaction.update({ embeds: [configsEmbeds[0]], components: [buttons] });
}

async function next(interaction)
{
	configsState.index++;
	const buttons = configsButtons(configsState.index);
	await interaction.update({ embeds: [configsEmbeds[configsState.index]], components: [buttons] });
}

async function back(interaction)
{
	if (configsState.index === 0)
	{ await interaction.update({ embeds: [startMsg], components: [startButtons] }); }
	else
	{
		configsState.index--;
		const buttons = configsButtons(configsState.index);
		await interaction.update({ embeds: [configsEmbeds[configsState.index]], components: [buttons] });
	}
}

async function setGuild(interaction)
{
	const modal = new ModalBuilder()
		.setCustomId('setGuildForm')
		.setTitle('Set guild')
		.addComponents(new ActionRowBuilder().addComponents(
			new TextInputBuilder()
				.setCustomId('setGuildInput')
				.setLabel('ENTER YOUR GUILD:')
				.setStyle(TextInputStyle.Short)
				.setRequired(true)));

	await interaction.showModal(modal);
}

async function setGuildLogic(interaction)
{
	const input = interaction.fields.getTextInputValue('setGuildInput');
	data.guild = input;
	fs.writeFileSync('config.json', JSON.stringify(data, null, 2));
	interaction.reply({ content: `Guild has been set to: ${input}`, ephemeral: true });
}

async function setServerID(interaction)
{
	const modal = new ModalBuilder()
		.setCustomId('setServerIDForm')
		.setTitle('Set Server ID')
		.addComponents(new ActionRowBuilder().addComponents(
			new TextInputBuilder()
				.setCustomId('setServerIDInput')
				.setLabel('ENTER YOUR SERVER ID:')
				.setStyle(TextInputStyle.Short)
				.setRequired(true)));

	await interaction.showModal(modal);
}

async function setServerIDLogic(interaction)
{
	const input = interaction.fields.getTextInputValue('setServerIDInput');
	data.serverID = input;
	fs.writeFileSync('config.json', JSON.stringify(data, null, 2));
	interaction.reply({ content: `Server ID has been set to: ${input}`, ephemeral: true });
}

async function setStaffRole(interaction)
{
	const modal = new ModalBuilder()
		.setCustomId('setStaffRoleForm')
		.setTitle('Set Staff Role(s)')
		.addComponents(new ActionRowBuilder().addComponents(
			new TextInputBuilder()
				.setCustomId('setStaffRoleInput')
				.setLabel('SEPARATE STAFF ROLE IDS USING A SPACE:')
				.setStyle(TextInputStyle.Short)
				.setRequired(true)));

	await interaction.showModal(modal);
}

async function setStaffRoleLogic(interaction)
{
	const input = interaction.fields.getTextInputValue('setStaffRoleInput');
	const roleIDs = input.split(' ');
	data.staffRole = roleIDs;
	fs.writeFileSync('config.json', JSON.stringify(data, null, 2));
	interaction.reply({ content: `Staff Role(s) has been set to:\n${roleIDs.join('\n')}`, ephemeral: true });
}

async function setGuildIcon(interaction)
{
	const modal = new ModalBuilder()
		.setCustomId('setGuildIconForm')
		.setTitle('Set Guild Icon')
		.addComponents(new ActionRowBuilder().addComponents(
			new TextInputBuilder()
				.setCustomId('setGuildIconInput')
				.setLabel('LINK AN IMAGE:')
				.setStyle(TextInputStyle.Short)
				.setRequired(true)));

	await interaction.showModal(modal);
}

async function setGuildIconLogic(interaction)
{
	const input = interaction.fields.getTextInputValue('setGuildIconInput');
	data.guildIcon = input;
	fs.writeFileSync('config.json', JSON.stringify(data, null, 2));
	interaction.reply({ content: `Guild Icon has been set to:\n${input}`, ephemeral: true });
}

async function setColorTheme(interaction)
{
	const modal = new ModalBuilder()
		.setCustomId('setColorThemeForm')
		.setTitle('Set Color Theme')
		.addComponents(new ActionRowBuilder().addComponents(
			new TextInputBuilder()
				.setCustomId('setColorThemeInput')
				.setLabel('ENTER A HEX COLOR (EX: \'FFFFFF\'):')
				.setStyle(TextInputStyle.Short)
				.setRequired(true)));

	await interaction.showModal(modal);
}

async function setColorThemeLogic(interaction)
{
	const input = interaction.fields.getTextInputValue('setColorThemeInput');
	data.colorTheme = input;
	fs.writeFileSync('config.json', JSON.stringify(data, null, 2));
	interaction.reply({ content: `Color Theme has been set to: #${input}`, ephemeral: true });
}

module.exports = { configs, next, back, setGuild, setGuildLogic, setServerID, setServerIDLogic, setStaffRole, setStaffRoleLogic, setGuildIcon, setGuildIconLogic, setColorTheme, setColorThemeLogic };