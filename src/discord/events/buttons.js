/* eslint-disable indent */

const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { log } = require('../../logger');

const lDir = path.join(__dirname, '../logic');
const lFiles = fs.readdirSync(lDir).filter(file => file.endsWith('.js'));
const Logic = lFiles.reduce((acc, file) => 
{
	const logicModule = require(path.join(lDir, file));

	if (typeof logicModule === 'object' && logicModule !== null) Object.assign(acc, logicModule);
	else { acc[file.replace('.js', '')] = logicModule; }

	return acc;
}, {});

module.exports =
{
	name: Events.InteractionCreate,
	async execute(interaction) 
	{
		if (!interaction.isButton()) return;
		log(interaction);

		const buttons = interaction.customId;

		switch (buttons) 
		{

		// setup.js
			
			case 'configs':
				await Logic.configs(interaction);
				break;
		
			case 'features':
				await Logic.features(interaction);
				break;

			case 'logging':
				await Logic.logging(interaction);
				break;

			case 'backToSetup':
				await Logic.backToSetup(interaction);
				break;

			case 'logsToggle':
			case 'logCommandsToggle':
			case 'logButtonsToggle':
			case 'logMenusToggle':
			case 'logFormsToggle':
				await Logic.toggleLogic(interaction);
				break;

		// help.js

			case 'cmds':
				await Logic.cmds(interaction);
				break;

			case 'credits':
				await Logic.credits(interaction);
				break;

			case 'support':
				await Logic.support(interaction);
				break;
			
			case 'mccmds':
				await Logic.mccmds(interaction);
				break;
				
			}
	}
};