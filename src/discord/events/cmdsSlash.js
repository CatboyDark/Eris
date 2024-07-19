const { Events } = require('discord.js');
const { createMsg } = require('../../builder.js');

const cmdError = (interaction) =>
{
	return error => 
	{
		const e = createMsg({
			color: 'FF0000',
			title: 'Error!',
			description: `${error.message}`
		});

		console.error(error);
		if (interaction.replied || interaction.deferred) 
		{
			return interaction.followUp({ embeds: [e] }); 
		} 
		else 
		{ 
			return interaction.reply({ embeds: [e] }); 
		}
	};
};

module.exports =
{
	name: Events.InteractionCreate,
	async execute(interaction) 
	{
		if (interaction.isChatInputCommand()) 
		{
			const command = interaction.client.sc.get(interaction.commandName);
			await command.execute(interaction).catch(cmdError(interaction));
		}
		else { return; }
	}
};