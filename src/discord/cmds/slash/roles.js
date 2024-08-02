const { SlashCommandBuilder } = require('discord.js');
const hypixel = require('../../../helper/hapi.js');
const { createMsg, createSlash } = require('../../../helper/builder.js');
const db = require('../../../mongo/schemas.js');
const { readConfig } = require('../../../helper/configUtils.js');
	
module.exports = createSlash({
	name: 'roles',
	desc: 'Update your roles',

	async execute(interaction) 
	{
		await interaction.deferReply();

		const user = interaction.user.id;
		
		try 
		{
			const data = await db.Link.findOne({ dcid: user }).exec();
			const uuid = data.uuid;
			const player = await hypixel.getPlayer(uuid);

			try { await interaction.member.setNickname(player.nickname); } 
			catch (e) { if (e.message.includes('Missing Permissions')) { interaction.followUp({ embeds: [createMsg({ color: 'FFA500', desc: '**Silly! I cannot change the nickname of the server owner!**', ephemeral: true })] }); console.log(e); } }

			const config = readConfig();
			if (config.features.linkRoleToggle) await interaction.member.roles.add(config.features.linkRole);
			if (config.features.guildRoleToggle) 
			{
				const guild = await hypixel.getGuild('player', player.uuid);
				if (guild && guild.name === config.guild) await interaction.member.roles.add(config.features.guildRole);
			}
		} 
		catch (error) 
		{
			throw error;
		}

		await interaction.followUp({ embeds: [createMsg({ desc: '<:gcheck:1244687091162415176> **Your roles have been updated!**' })], ephemeral: true });
	}
});
