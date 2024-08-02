const { readConfig, writeConfig } = require('./configUtils.js');

const map = // Button to Config
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
		'removeRoleOnLink': 'removeRoleOnLink',
		'linkRoleToggle': 'linkRoleToggle',
		'guildRoleToggle': 'guildRoleToggle'
	}
};

const getColor = (enabled) => enabled ? 'Green' : 'Red';

async function newColors(interaction) 
{
	const config = readConfig();
	const { customId } = interaction;

	for (const [category, buttons] of Object.entries(map)) 
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
	for (const [category, buttons] of Object.entries(map)) 
	{
		for (const [buttonId, key] of Object.entries(buttons)) 
		{
			buttonColors[buttonId] = getColor(config[category][key]);
		}
	}
    
	return buttonColors;
}

module.exports = {
	buttonMap: map,
	newColors
};