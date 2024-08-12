const { Events } = require('discord.js');
const log = require('../../helper/logger.js');
const { readLogic } = require('../../helper/utils.js');

const map = // Exceptions
{
	'logging': ['logsToggle', 'logCommandsToggle', 'logButtonsToggle', 'logMenusToggle', 'logFormsToggle' ],
	'welcome': ['welcomeMsgToggle', 'welcomeRoleToggle', 'removeRoleOnLink' ],
	'accountLinking': ['linkRoleToggle', 'guildRoleToggle']
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

		const customId = interaction.customId;
		const handler = buttonHandler[customId];

		if (handler) await handler(interaction);
		else 
		{
			const mappedLogic = map[customId];
			if (mappedLogic) 
			{
				if (Logic[mappedLogic]) console.warn(`${customId} mapped to ${mappedLogic} does not exist!`);
				else console.warn(`Logic for ${customId} (${mappedLogic}) does not exist!`);
			} 
			else console.warn(`Logic for ${customId} does not exist!`);
		}
	}
};