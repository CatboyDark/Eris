const { startMsg, startButtons } = require('../../logic/configs/assets.js');
const { createSlash } = require('../../../helper/builder.js');

module.exports = createSlash({
	name: 'setup',
	desc: 'Bot setup',
	permissions: ['ManageGuild'],
		
	async execute(interaction) 
	{
		await interaction.reply({ embeds: [startMsg], components: [startButtons] });
	}
});