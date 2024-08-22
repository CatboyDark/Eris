// const { createSlash, createMsg } = require('../../../helper/builder');
// const { getDiscord, getPlayer, getCataHighest, getSkills, getNw, getCata, getGuild, readConfig } = require('../../../helper/utils.js');
// const { Link } = require('../../../mongo/schemas.js');
// const hypixel = require('../../../helper/hapi.js');

// module.exports = createSlash({
// 	name: 'status',
// 	desc: 'Sets Status',
// 	options: [
// 		{ type: 'string', name: 'status', desc: 'Enter a status', required: true },
// 	],

// 	async execute(interaction) 
// 	{
// 		interaction.reply('t');

// 		// const sbMember = await hypixel.getSkyblockMember(player.uuid);

// 		// for (const [profileName, profileData] of sbMember.entries()) 
// 		// {
// 		// 	console.log(await profileData.getNetworth());
// 		// }

// 		// const config = readConfig();
// 		// const guild = await getGuild('guild', config.guild);
// 		// if (guild && guild.ranks && Array.isArray(guild.ranks)) 
// 		// {
// 		// 	const guildRanks = guild.ranks.map(rank => rank.name);
// 		// 	console.log('Guild Ranks:', guildRanks);
// 		// }

// 		const status = interaction.options.getStringOption('string')
// 		await interaction.client.user.setActivity(status, {type: ActivityType.Watching});
// 	}
// });

// const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// module.exports = 
// {
//     type: 'slash',
//     data: new SlashCommandBuilder()
//         .setName('status')
//         .setDescription('Sets bot status')
//         .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
// 		.setOptions(
			
// 		),

//     async execute(interaction) 
//     {
// 		const status = interaction.options.getStringOption('status');
// 		const type = interaction.options.getStringOption('type')
//         await interaction.client.user.setActivity(status, {type: ActivityType.Watching});
//     }
// };