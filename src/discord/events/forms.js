const { Events } = require('discord.js');
const log = require('../../helper/logger.js');
const readLogic = require('../../helper/logicUtils.js');

const Logic = readLogic();

const formHandler = Object.keys(Logic).reduce((acc, logicName) => 
{
	const formId = `${logicName}Form`;
	acc[formId] = Logic[logicName];
    
	return acc;
}, {});
	
module.exports = 
	{
		name: Events.InteractionCreate,
		async execute(interaction) 
		{
			if (!interaction.isModalSubmit()) return;
			log(interaction);

			const logicName = interaction.customId.replace(/Form$/, '');
			const handler = formHandler[`${logicName}Form`];
	
			if (handler) await handler(interaction);
			else console.warn(`${interaction.customId} logic does not exist!`);
		}
	};