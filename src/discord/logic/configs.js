const { createMsg, createRow, createModal } = require('./../../builder.js');
const { readConfig, writeConfig } = require('../../configUtils.js');
const { startMsg, startButtons } = require('../cmds/slash/setup.js');

const configsEmbeds = 
[
	createMsg({
		title: 'Guild',
		description: '*Required*\n\n' +
                     'Enter your EXACT guild name.\n\n' +
                     '*Note: wristspasm ≠ WristSpasm*'
	}),
	createMsg({
		title: 'Server ID',
		description: '*Required*\n\n' +
                     'Enter your Discord server ID.'
	}),
	createMsg({
		title: 'Staff Roles',
		description: '*Required*\n\n' +
                     'Enter your staff role IDs.\n' +
                     'If you have more than one staff role, separate them using a space.\n\n' +
                     '*Note: Staff will be able to:*\n' +
                     '- *Delete messages*\n' +
                     '- *Assign roles below their own role*'
	}),
	createMsg({
		title: 'Guild Icon',
		description: '*Optional*\n\n' +
                     'Link an image of your guild icon. If you don\'t, a default will be provided.'
	}),
	createMsg({
		title: 'Color Theme',
		description: '*Optional*\n\n' +
                     'Enter a 6 digit HEX.\n' +
                     'This will be used as the main bot color.'
	}),
	createMsg({
		title: 'Yay!',
		description: '**Your bot is now functional!**\n' +
                     'Next, why don\'t you check out some features?'
	})
];

function configsButtons(index) 
{
	const buttonConfigs = [
		{ id: 'back', label: '<', style: 'Success' }
	  ];

	switch (index) 
	{
	case 0: 
		buttonConfigs.push({ id: 'setGuild', label: 'Guild', style: 'Primary' }); 
		break;
	case 1:
		buttonConfigs.push({ id: 'setServerID', label: 'Server ID', style: 'Primary' });
		break;
	case 2:
		buttonConfigs.push({ id: 'setStaffRole', label: 'Staff Role(s)', style: 'Primary' });
		break;
	case 3:
		 buttonConfigs.push({ id: 'setGuildIcon', label: 'Guild Icon', style: 'Primary' });
		break;
	case 4:
		buttonConfigs.push({ id: 'setColorTheme', label: 'Color Theme', style: 'Primary' });
		break;
	}

	if (index < configsEmbeds.length - 1) 
	{
		buttonConfigs.push({ id: 'next', label: '>', style: 'Success' });
	}
	
	if (index === configsEmbeds.length - 1) 
	{
		buttonConfigs.push({ id: 'features', label: 'Features', style: 'Primary' });
	}

	return createRow(buttonConfigs);
}

const configsMenu = createRow([
	{
		id: 'configsMenu',
		placeholder: 'Select a config',
		options:
		[
			{ value: 'setGuild', label: 'Guild', description: 'Required' },
			{ value: 'setServerID', label: 'Server ID', description: 'Required' },
			{ value: 'setStaffRole', label: 'Staff Role(s)', description: 'Required' },
			{ value: 'setGuildIcon', label: 'Guild Icon', description: 'Optional' },
			{ value: 'setColorTheme', label: 'Color Theme', description: 'Optional' }
		]
	}
]);

const configsState = { index: 0 };

async function configs(interaction) 
{
	configsState.index = 0;
	const buttons = configsButtons(configsState.index);
	await interaction.update({ embeds: [configsEmbeds[0]], components: [buttons, configsMenu] });
}

async function next(interaction) 
{
	configsState.index++;
	const buttons = configsButtons(configsState.index);
	await interaction.update({ embeds: [configsEmbeds[configsState.index]], components: [buttons, configsMenu] });
}

async function back(interaction) 
{
	if (configsState.index === 0) 
	{ await interaction.update({ embeds: [startMsg], components: [startButtons] }); } 
	else 
	{
		configsState.index--;
		const buttons = configsButtons(configsState.index);
		await interaction.update({ embeds: [configsEmbeds[configsState.index]], components: [buttons, configsMenu] });
	}
}

async function setGuild(interaction)
{
	const modal = createModal({
		id: 'setGuildForm',
		title: 'Set Guild',
		components: [{
			id: 'setGuildInput',
			label: 'ENTER YOUR GUILD:',
			style: 'SHORT',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function setGuildLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setGuildInput');
	const data = readConfig();
	data.guild = input;
	writeConfig(data);
	interaction.reply({ content: `Guild has been set to: ${input}`, ephemeral: true });
}

async function setServerID(interaction) 
{
	const modal = createModal({
		id: 'setServerIDForm',
		title: 'Set Server ID',
		components: [{
			type: 'textInput',
			id: 'setServerIDInput',
			label: 'ENTER YOUR SERVER ID:',
			style: 'SHORT',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function setServerIDLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setServerIDInput');
	const data = readConfig();
	data.serverID = input;
	writeConfig(data);
	interaction.reply({ content: `Server ID has been set to: ${input}`, ephemeral: true });
}

async function setStaffRole(interaction) 
{
	const modal = createModal({
		id: 'setStaffRoleForm',
		title: 'Set Staff Role(s)',
		components: [{
			type: 'textInput',
			id: 'setStaffRoleInput',
			label: 'SEPARATE STAFF ROLE IDS USING A SPACE:',
			style: 'SHORT',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function setStaffRoleLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setStaffRoleInput');
	const roleIDs = input.split(' ');
	const data = readConfig();
	data.staffRole = roleIDs;
	writeConfig(data);
	interaction.reply({ content: `Staff Role(s) has been set to:\n${roleIDs.join('\n')}`, ephemeral: true });
}

async function setGuildIcon(interaction) 
{
	const modal = createModal({
		id: 'setGuildIconForm',
		title: 'Set Guild Icon',
		components: [{
			type: 'textInput',
			id: 'setGuildIconInput',
			label: 'LINK AN IMAGE:',
			style: 'SHORT',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function setGuildIconLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setGuildIconInput');
	const data = readConfig();
	data.guildIcon = input;
	writeConfig(data);
	interaction.reply({ content: `Guild Icon has been set to:\n${input}`, ephemeral: true });
}

async function setColorTheme(interaction) 
{
	const modal = createModal({
		id: 'setColorThemeForm',
		title: 'Set Color Theme',
		components: [{
			type: 'textInput',
			id: 'setColorThemeInput',
			label: 'ENTER A HEX COLOR (EX: \'FFFFFF\'):',
			style: 'SHORT',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function setColorThemeLogic(interaction) {
	const input = interaction.fields.getTextInputValue('setColorThemeInput');
	const data = readConfig();
	data.colorTheme = input;
	writeConfig(data);
	interaction.reply({ content: `Color Theme has been set to: #${input}`, ephemeral: true });
}

module.exports = 
{ 
	configs,
	configsEmbeds,
	configsButtons,
	configsMenu,
	next, 
	back, 
	setGuild, 
	setGuildLogic, 
	setServerID, 
	setServerIDLogic, 
	setStaffRole, 
	setStaffRoleLogic, 
	setGuildIcon, 
	setGuildIconLogic, 
	setColorTheme, 
	setColorThemeLogic 
};