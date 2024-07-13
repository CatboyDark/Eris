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
	
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction)
	{
		if (!interaction.isModalSubmit())
		{ return; }

		const modals = interaction.customId;

		switch (modals) 
		{

		case 'setGuildForm':
			await Logic.setGuildLogic(interaction);
			break;
			
		case 'setServerIDForm':
			await Logic.setServerIDLogic(interaction);
			break;
			
		case 'setStaffRoleForm':
			await Logic.setStaffRoleLogic(interaction);
			break;
			
		case 'setGuildIconForm':
			await Logic.setGuildIconLogic(interaction);
			break;
			
		case 'setColorThemeForm':
			await Logic.setColorThemeLogic(interaction);
			break;
			
		}
	}
};