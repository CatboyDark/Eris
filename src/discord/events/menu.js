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
		if (!interaction.isStringSelectMenu()) 
		{ return; }

		const { customId, values } = interaction;

		switch (customId) 
		{
			case 'configsMenu':
				let index;
				const selectedValue = values[0];
            	switch (selectedValue) 
				{
					case 'setGuild':
						index = 0;
						break;

					case 'setServerID':
						index = 1;
						break;

					case 'setStaffRole':
						index = 2;
						break;

					case 'setGuildIcon':
						index = 3;
						break;

					case 'setColorTheme':
						index = 4;
						break;
            	}
				const buttons = Logic.configsButtons(index);
            	await interaction.update({ embeds: [Logic.configsEmbeds[index]], components: [buttons, Logic.configsMenu] });
			break;
		}
	}
};