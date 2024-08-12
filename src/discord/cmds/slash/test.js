const { createSlash, createMsg } = require('../../../helper/builder');
const hypixel = require('../../../helper/hapi.js');
const { getDiscord } = require('../../../helper/utils.js');
const db = require('../../../mongo/schemas.js');

async function getCata(interaction, uuid) 
{
	await interaction.deferReply();
	try {
		const sbMember = await hypixel.getSkyblockMember(uuid);

		const highestCataLevel = 0;

		

		await interaction.reply('Highest Catacombs level: ' + highestCataLevel);
	} 
	catch (error) 
	{
		console.error(error);
	}
}

module.exports = createSlash({
	name: 'test',
	desc: 'tests stuff',
	options: [
		{ type: 'string', name: 'user', description: 'Enter a user', required: true }
	],

	async execute(interaction) 
	{
		// const data = await db.Link.findOne({ dcid: interaction.user.id }).exec();
		// await getCata(interaction, data.uuid);

		const user = interaction.options.getString('user');
		const discord = await getDiscord(user);

		await interaction.reply({ embeds: [createMsg({ desc: `${user}'s discord is ${discord}` })] });
	}
});
