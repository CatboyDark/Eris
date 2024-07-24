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
		if (!interaction.isStringSelectMenu()) return;
		log(interaction);

		const { customId, values } = interaction;

		switch (customId) 
		{
			case 'configsMenu':
				const selectedValue = values[0];
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

					case 'setGuildIcon':
						await Logic.setGuildIcon(interaction);
						break;

					case 'setColorTheme':
						await Logic.setColorTheme(interaction);
						break;
            	}
			break;
		}
	}
};