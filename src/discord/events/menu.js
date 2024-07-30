/* eslint-disable indent */

const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const log = require('../../helper/logger.js');

const lDir = path.join(__dirname, '../logic');
const lFiles = fs.readdirSync(lDir).filter(file => file.endsWith('.js'));
const Logic = lFiles.reduce((acc, file) => 
{
	const logicModule = require(path.join(lDir, file));
	
	if (typeof logicModule === 'object' && logicModule !== null) Object.assign(acc, logicModule);
	else acc[file.replace('.js', '')] = logicModule;
	
	return acc;
}, {});
	
module.exports = 
{
	name: Events.InteractionCreate,
	async execute(interaction)
	{
		if (!interaction.isStringSelectMenu()) return;
		log(interaction);

		const { customId, values } = interaction;
		const selectedValue = values[0];

		switch (customId) 
		{
			case 'configsMenu':
            	switch (selectedValue) 
				{
					case 'setGuild':
						await Logic.setGuild(interaction);
						break;

					case 'setStaffRole':
						await Logic.setStaffRole(interaction);
						break;

					case 'setLogsChannel':
						await Logic.setLogsChannel(interaction);
						break;

					case 'setIcon':
						await Logic.setIcon(interaction);
						break;

					case 'setColorTheme':
						await Logic.setColorTheme(interaction);
						break;
            	}
			break;

			case 'featuresMenu':
            	switch (selectedValue) 
				{
					case 'setWelcome':
						await Logic.welcome(interaction);
						break;
				}

		}
	}
};