const { EmbedBuilder } = require('discord.js');

const embed = new EmbedBuilder().setColor('000000').setDescription('**Secret Staff Commands**');

module.exports = 
{
	type: 'plain',
	name: '.h',

	async execute(message) 
	{
		await message.channel.send({ embeds: [embed] });
	}
};
