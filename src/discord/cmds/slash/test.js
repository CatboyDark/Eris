const { createSlash, createMsg } = require('../../../helper/builder');
const { getDiscord, getPlayer, getCataHighest, getSkills, getNw, getCata, getGuild } = require('../../../helper/utils.js');
const { Link } = require('../../../mongo/schemas.js');

module.exports = createSlash({
	name: 'test',
	desc: 'tests stuff',
	options: [
		{ type: 'string', name: 'user', description: 'Enter a user', required: true }
	],

	async execute(interaction) 
	{
		const user = interaction.options.getString('user');
		
		const nw = await getCata(user);

		await interaction.reply('cata: ' + nw);
	}
});