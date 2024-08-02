const { Events } = require('discord.js');
const log = require('../../helper/logger.js');
const readLogic = require('../logic/logicUtils.js');

const map = // Logic Function to Form Submit
{
	// Setup
	setGuild: ['setGuildForm'],
	setServerID: ['setServerIDForm'],
	setStaffRole: ['setStaffRoleForm'],
	setLogsChannel: ['setLogsChannelForm'],
	setGuildIcon: ['setGuildIconForm'],
	setColorTheme: ['setColorThemeForm'],

	// Welcome
	setWelcomeChannel: ['setWelcomeChannelForm'],
	setWelcomeMsg: ['setwelcomeMsgForm'],
	setWelcomeRole: ['setWelcomeRoleForm'],

	// Link
	setLinkChannel: ['setLinkChannelForm'],
	setLinkRole: ['setLinkRoleForm'],
	setGuildRole: ['setGuildRoleForm'],
	link: ['linkForm']
};

const Logic = readLogic();

const formHandlers = Object.keys(Logic).reduce((acc, key) => 
{
	if (map[key]) map[key].forEach(formId => acc[formId] = Logic[key]);
	else acc[key] = Logic[key];
	return acc;
}, {});

module.exports = 
{
	name: Events.InteractionCreate,
	async execute(interaction) 
	{
		if (!interaction.isModalSubmit()) return;
		log(interaction);

		const handler = formHandlers[interaction.customId];

		if (handler) await handler(interaction);
		else console.warn(`Missing logic for form: ${interaction.customId}`);
	}
};