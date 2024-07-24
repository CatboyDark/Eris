const { createMsg, createRow } = require('../../builder.js');
const { readConfig, writeConfig } = require('../../configUtils.js');
const { logMsg } = require('../../logger.js');

const buttonMap = 
{
	'logsToggle': 'enabled',
	'logCommandsToggle': 'commands',
	'logButtonsToggle': 'buttons',
	'logFormsToggle': 'forms'
};

const getColor = (enabled) => enabled ? 'Green' : 'Red';

const loggingMsg = createMsg({
	title: 'Logging',
	desc:
        '**Configure what events will be sent to the Logs channel.**\n\n' +
        '1. `Commands`: Log all commands ran\n' +
        '2. `Buttons`: Log all buttons pressed\n' +
        '3. `Forms`: Log all forms submitted'
});

function logButtons() 
{
	const color = updatedColors();
	return createRow([
		{ id: 'logCommandsToggle', label: 'Log Commands', style: color['logCommandsToggle'] },
		{ id: 'logButtonsToggle', label: 'Log Buttons', style: color['logButtonsToggle'] },
		{ id: 'logFormsToggle', label: 'Log Forms', style: color['logFormsToggle'] }
	]);
}

function backRow() 
{
	const color = updatedColors();
	return createRow([
		{ id: 'backToStart', label: 'Back', style: 'Gray' },
		{ id: 'logsToggle', label: 'Toggle ALL Logs', style: color['logsToggle'] }
	]);
}

function updatedColors() 
{
	const data = readConfig();
	const buttonColors = {};

	for (const [buttonId, configKey] of Object.entries(buttonMap)) 
	{
		if (configKey === 'all') 
		{
			const allLogsEnabled = Object.values(data.logs).every(log => log);
			buttonColors[buttonId] = getColor(allLogsEnabled);
		} 
		else 
		{
			buttonColors[buttonId] = getColor(data.logs[configKey]);
		}
	}
	return buttonColors;
}

function logging(interaction) 
{
	interaction.update({ embeds: [loggingMsg], components: [logButtons(), backRow()] });
}

async function toggleLogic(interaction) 
{
	const data = readConfig();
	const configKey = buttonMap[interaction.customId];
	if (configKey === 'enabled') 
	{
		const allLogsEnabled = Object.values(data.logs).every(log => log);
		for (const key in data.logs) data.logs[key] = !allLogsEnabled;
	} 
	else 
	{
		data.logs[configKey] = !data.logs[configKey];
	}
	writeConfig(data);
	logging(interaction);
}

module.exports = { logging, toggleLogic };
