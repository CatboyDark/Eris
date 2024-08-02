const { Events } = require('discord.js');
const log = require('../../helper/logger.js');
const readLogic = require('../logic/logicUtils.js');

const map = // Logic Function to Menu Select Item
{
	configsMenu: 
	{
		setGuild: 'setGuild',
		setStaffRole: 'setStaffRole',
		setLogsChannel: 'setLogsChannel',
		setIcon: 'setIcon',
		setColorTheme: 'setColorTheme'
	},
	featuresMenu: 
	{
		welcomeFeatures: 'welcomeFeatures',
		accountLinking: 'accountLinking'
	}
};

const Logic = readLogic();
	
const menuHandler = async (interaction) => 
{
	const { customId, values } = interaction;
	const selectedValue = values[0];
	const logicName = map[customId]?.[selectedValue];
    
	if (logicName) 
	{
		const logicFunction = Logic[logicName];
		if (logicFunction) await logicFunction(interaction);
		else console.warn(`Missing logic function for menu: ${logicName}`);
	} 
	else console.warn(`[WARNING] Missing handler for menu ID: ${customId} and value: ${selectedValue}`);
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