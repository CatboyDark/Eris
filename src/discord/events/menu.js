const { Events } = require('discord.js');
const log = require('../../helper/logger.js');
const readLogic = require('../../helper/logicUtils.js');

const Logic = readLogic();
	
const menuHandler = async (interaction) => 
{
	const { values } = interaction;
	const selectedValue = values[0];

	const logicFunction = Logic[selectedValue];

	if (logicFunction) await logicFunction(interaction);
	else console.warn(`${selectedValue} logic does not exist!`);
};

module.exports = 
{
	name: Events.InteractionCreate,
	async execute(interaction) 
	{
		if (!interaction.isStringSelectMenu()) return;
		log(interaction);

		await menuHandler(interaction);
	}
};