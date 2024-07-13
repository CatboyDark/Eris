const { EmbedBuilder } = require('discord.js');
const { colorTheme } = require('../../../../config.json');
const fs = require('fs')

fs.existsSync('data.json') ? JSON.parse(fs.readFileSync('data.json', 'utf8')) : {};

const embed = new EmbedBuilder().setColor(colorTheme).setDescription('**Secret Staff Commands**');

module.exports = 
{
	type: 'plain',
	name: '.h',

	async execute(message) 
	{
		await message.channel.send({ embeds: [embed] });
	}
};
