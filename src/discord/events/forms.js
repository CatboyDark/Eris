const { Events } = require('discord.js');
const log = require('../../helper/logger.js');
const readLogic = require('../../helper/logicUtils.js');

const map = 
{
	'setLinkRoleForm': 'linkRoleToggle',
	'setGuildRoleForm': 'guildRoleToggle'
};

const Logic = readLogic();
const formHandler = {};

Object.keys(Logic).forEach(logicName => 
{
	const formId = `${logicName}Form`;
	formHandler[formId] = Logic[logicName];
});

Object.entries(map).forEach(([formId, logicName]) => { formHandler[formId] = Logic[logicName]; });

module.exports =
{
	name: Events.InteractionCreate,
	async execute(interaction) 
	{
		if (!interaction.isModalSubmit()) return;
		log(interaction);

		const handler = formHandler[interaction.customId];

		if (handler) await handler(interaction);
		else console.warn(`${interaction.customId} logic does not exist!`);
	}
};