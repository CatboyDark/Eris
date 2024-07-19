/* eslint-disable indent */

const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const lDir = path.join(__dirname, '../logic');
const lFiles = fs.readdirSync(lDir).filter(file => file.endsWith('.js'));
const Logic = lFiles.reduce((acc, file) => 
{
	const logicModule = require(path.join(lDir, file));

	if (typeof logicModule === 'object' && logicModule !== null) 
	{ Object.assign(acc, logicModule); } 
	else { acc[file.replace('.js', '')] = logicModule; }

	return acc;
}, {});

module.exports =
{
	name: Events.InteractionCreate,
	async execute(interaction) 
	{
		if (!interaction.isButton())
		{ return; }

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
				
			case 'back':
				await Logic.back(interaction);
				break;
					
			case 'next':
				await Logic.next(interaction);
				break;
					
			case 'setGuild':
				await Logic.setGuild(interaction);
				break;
					
			case 'setServerID':
				await Logic.setServerID(interaction);
				break;
					
			case 'setStaffRole':
				await Logic.setStaffRole(interaction);
				break;
			
			case 'setGuildIcon':
				await Logic.setGuildIcon(interaction);
				break;
			
			case 'setColorTheme':
				await Logic.setColorTheme(interaction);
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