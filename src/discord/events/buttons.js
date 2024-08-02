const { Events } = require('discord.js');
const log = require('../../helper/logger.js');
const readLogic = require('../logic/logicUtils.js');

const map = // Logic Function to Button
{
	// Setup
	'configs': ['configs'],
	'features': ['features'],
	'logging': 
	[
		'logging',
		'logsToggle',
		'logCommandsToggle',
		'logButtonsToggle',
		'logMenusToggle',
		'logFormsToggle'
	],
	'backToSetup': ['backToSetup'],
	'backToFeatures': ['backToFeatures'],
	'setGuildForm': ['setGuild'],
	'setStaffRoleForm': ['setStaffRole'],
	'setLogsChannelForm': ['setLogsChannel'],
	'setIconForm': ['setIcon'],
	'setColorThemeForm': ['setColorTheme'],

	// Welcome
	'setWelcomeChannelForm': ['setWelcomeChannel'],
	'setWelcomeMsgForm': ['setwelcomeMsg'],
	'setWelcomeRoleForm': ['setWelcomeRole'],

	// Link
	'setLinkChannelForm': ['setLinkChannel'],
	'setLinkRoleForm': ['setLinkRole'],
	'setGuildRoleForm': ['setGuildRole'],
	'accountLinking': 
	[
		'linkRoleToggle',
		'guildRoleToggle'
	],
	'linkHelp': ['linkHelp'],
	'linkForm': ['link'],

	// Help
	'cmds': ['cmds'],
	'credits': ['credits'],
	'support': ['support'],
	'MCcmds': ['MCcmds'],
	'welcome': 
	[
		'welcomeMsgToggle',
		'welcomeRoleToggle',
		'removeRoleOnLink'
	],

	// Data
	'commandData': ['commandData'],
	'buttonData': ['buttonData']
};

const Logic = readLogic();

const buttonHandlers = Object.keys(map).reduce((acc, key) => 
{
	map[key].forEach(buttonId => acc[buttonId] = Logic[key]);
	return acc;
}, {});

module.exports = 
{
	name: Events.InteractionCreate,
	async execute(interaction) 
	{
		if (!interaction.isButton()) return;
		log(interaction);

		const handler = buttonHandlers[interaction.customId];

		if (handler) await handler(interaction);
		else console.warn(`Missing logic for button: ${interaction.customId}`);
	}
};