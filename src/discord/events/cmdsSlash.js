const { Events, EmbedBuilder } = require('discord.js');

const cmdError = (interaction) =>
{
	return error => 
	{
		const e = new EmbedBuilder().setColor('FF0000').setTitle('Error!').setDescription(`${error.message}`);

		console.error(error);
		if (interaction.replied || interaction.deferred) 
		{ return interaction.followUp({ embeds: [e] }); } 
		else { return interaction.reply({ embeds: [e] }); }
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