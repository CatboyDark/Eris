const { createMsg, createRow } = require('../../builder.js');
const { readConfig, writeConfig } = require('../../configUtils.js');

const buttonMap = 
{
	'logsToggle': 'enabled',
	'logCommandsToggle': 'commands',
	'logButtonsToggle': 'buttons',
	'logMenusToggle': 'menus',
	'logFormsToggle': 'forms'
};

const getColor = (enabled) => enabled ? 'Green' : 'Red';

const loggingMsg = createMsg({
	title: 'Logging',
	desc:
        '**Configure what events will be sent to the Logs channel.**\n\n' +
        '1. `Commands`: Log commands ran\n' +
        '2. `Buttons`: Log buttons pressed\n' +
		'2. `Menus`: Log select menu options pressed\n' +
        '3. `Forms`: Log forms submitted'
});

function logButtons() 
{
	const color = updatedColors();
	return createRow([
		{ id: 'logCommandsToggle', label: 'Log Commands', style: color['logCommandsToggle'] },
		{ id: 'logButtonsToggle', label: 'Log Buttons', style: color['logButtonsToggle'] },
		{ id: 'logMenusToggle', label: 'Log Menus', style: color['logMenusToggle'] },
		{ id: 'logFormsToggle', label: 'Log Forms', style: color['logFormsToggle'] }
	]);
}

function backRow() 
{
	const color = updatedColors();
	return createRow([
		{ id: 'backToSetup', label: 'Back', style: 'Gray' },
		{ id: 'logsToggle', label: 'Enable Logging', style: color['logsToggle'] }
	]);
}

function updatedColors() 
{
	const config = readConfig();
	const buttonColors = {};

	for (const [buttonId, configKey] of Object.entries(buttonMap)) 
	{
		buttonColors[buttonId] = getColor(config.logs[configKey]);
	}
	return buttonColors;
}

function logging(interaction) 
{
	const config = readConfig();
	if (!config.logsChannel)
	{
		interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**You must add a logs channel first!**', ephemeral: true })] });
	}
	else
	{
		interaction.update({ embeds: [loggingMsg], components: [logButtons(), backRow()] });
	}
}

async function toggleLogic(interaction) 
{
	const config = readConfig();
	const configKey = buttonMap[interaction.customId];

	config.logs[configKey] = !config.logs[configKey];

	writeConfig(config);
	logging(interaction);
}

module.exports = { logging, toggleLogic };
