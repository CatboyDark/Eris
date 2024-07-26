const { readConfig, writeConfig } = require('./configUtils.js');

const buttonMap = 
{
	logs: 
	{
		'logsToggle': 'enabled',
		'logCommandsToggle': 'commands',
		'logButtonsToggle': 'buttons',
		'logMenusToggle': 'menus',
		'logFormsToggle': 'forms'
	},
	features: 
	{
		'welcomeMsgToggle': 'welcomeMsgToggle',
		'welcomeRoleToggle': 'welcomeRoleToggle',
		'removeRoleOnLink': 'removeRoleOnLink'
	}
};

const getColor = (enabled) => enabled ? 'Green' : 'Red';

async function newColors(interaction) 
{
	const config = readConfig();
	const { customId } = interaction;

	for (const [category, buttons] of Object.entries(buttonMap)) 
	{
		if (buttons.hasOwnProperty(customId)) 
		{
			const key = buttons[customId];
			config[category][key] = !config[category][key];
			break;
		}
	}

	writeConfig(config);

	const buttonColors = {};
	for (const [category, buttons] of Object.entries(buttonMap)) 
	{
		for (const [buttonId, key] of Object.entries(buttons)) 
		{
			buttonColors[buttonId] = getColor(config[category][key]);
		}
	}
    
	return buttonColors;
}

module.exports = {
	buttonMap,
	newColors
};