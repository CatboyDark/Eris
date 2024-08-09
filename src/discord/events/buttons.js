const { Events } = require('discord.js');
const log = require('../../helper/logger.js');
const readLogic = require('../../helper/logicUtils.js');

const map = // Exceptions
{
	'logsToggle': 'logging',
	'logCommandsToggle': 'logging',
	'logButtonsToggle': 'logging',
	'logMenusToggle': 'logging',
	'logFormsToggle': 'logging',

	'welcomeMsgToggle': 'welcome',
	'welcomeRoleToggle': 'welcome',
	'removeRoleOnLink': 'welcome'
};

const Logic = readLogic();

const buttonHandler = Object.keys(Logic).reduce((acc, logicName) => 
{
	acc[logicName] = Logic[logicName];

	for (const [buttonId, exceptionLogic] of Object.entries(map)) 
	{
		if (exceptionLogic === logicName) acc[buttonId] = Logic[logicName];
	}

	return acc;
}, {});

module.exports = 
{
	name: Events.InteractionCreate,
	async execute(interaction) 
	{
		if (!interaction.isButton()) return;
		log(interaction);

		const handler = buttonHandler[interaction.customId];

		if (handler) await handler(interaction);
		else console.warn(`${interaction.customId} logic does not exist!`);
	}
};