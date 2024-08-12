const { createSlash, createError, createMsg } = require('../../../helper/builder.js');
const { getEmoji, readConfig, getPlayer, getDiscord, getGuild, getSBLevelHighest } = require('../../../helper/utils.js');
const db = require('../../../mongo/schemas.js');
const Errors = require('hypixel-api-reborn');

const notLinked = createError('**Discord is not linked!**\n_ _\nClick on **How To Link** for more info.');
const noMatch = createError('**Discord does not match!**\n_ _\nClick on **How To Link** for more info.');
const invalidIGN = createError('**Invalid Username!**');

module.exports = createSlash({
	name: 'link',
	desc: 'Link your account',
	options: [
		{ type: 'string', name: 'ign', description: 'Enter your IGN', required: true }
	],
    
	async execute(interaction) 
	{
		await interaction.deferReply();

		const input = interaction.options.getString('ign');
		const check = await getEmoji('check');
		const plus = await getEmoji('plus');
		const minus = await getEmoji('minus');

		try
		{
			const config = readConfig();

			const player = await getPlayer(input);
			const discord = await getDiscord(player.uuid);
			if (!discord) 
				return interaction.followUp({ embeds: [notLinked] });
			if (interaction.user.username !== discord) 
				return interaction.followUp({ embeds: [noMatch] });

			// Register into DB
			db.Link.create({ uuid: player.uuid, dcid: interaction.user.id })
				.catch((e) => { if (e.code === 11000) console.log('playersLinked: Duplicate Key!'); });;

			// Set Nickname
			interaction.member.setNickname(player.nickname)
				.catch(e => {
					if (e.message.includes('Missing Permissions')) 
						return interaction.followUp({ embeds: [createMsg({ color: 'FFA500', desc: '**Silly! I cannot change the nickname of the server owner!**' })]});
				});

			const addedRoles = [];
			const removedRoles = [];

			// Assign Linked and Guild Role
			if (config.features.linkRoleToggle)
			{
				if (!interaction.member.roles.cache.has(config.features.linkRole))
				{
					await interaction.member.roles.add(config.features.linkRole);
					addedRoles.push(config.features.linkRole);
				}
			}
			if (config.features.guildRoleToggle)
			{
				const guild = await getGuild('player', player.uuid);
				if (guild && guild.name === config.guild)
				{
					if (!interaction.member.roles.cache.has(config.features.guildRole))
					{
						await interaction.member.roles.add(config.features.guildRole); 
						addedRoles.push(config.features.guildRole);
					}
				}
				else
				{
					if (interaction.member.roles.cache.has(config.features.guildRole))
					{
						await interaction.member.roles.remove(config.features.guildRole); 
						removedRoles.push(config.features.guildRole);
					}
				}
			}

			// Assign SB Level Role
			if (config.features.levelRolesToggle)
			{
				const highestLevel = await getSBLevelHighest(player);
				const roleIndex = Math.min(config.levelRoles.length - 1, Math.floor(highestLevel / 40));
				const assignedRole = config.levelRoles[roleIndex];
		
				if (!interaction.member.roles.cache.has(assignedRole)) 
				{
					await interaction.member.roles.add(assignedRole);
					addedRoles.push(assignedRole);
				}
				for (const role of config.levelRoles) 
				{
					if (interaction.member.roles.cache.has(role) && role !== assignedRole)
					{
						await interaction.member.roles.remove(role);
						removedRoles.push(role);
					}
				}
			}

			let desc;
			if (addedRoles.length > 0 && removedRoles.length > 0)
			{
				desc = `${check} **Account linked!**\n_ _\n`;
				desc += `${addedRoles.map(roleId => `${plus} <@&${roleId}>`).join('\n')}\n_ _\n`;
				desc += `${removedRoles.map(roleId => `${minus} <@&${roleId}>`).join('\n')}`;
			}
			else if (addedRoles.length > 0)
			{
				desc = `${check} **Account linked!**\n_ _\n`;
				desc += `${addedRoles.map(roleId => `${plus} <@&${roleId}>`).join('\n')}\n_ _`;
			}
			else if (removedRoles.length > 0)
			{
				desc = `${check} **Account linked!**\n_ _\n`;
				desc += `${removedRoles.map(roleId => `${minus} <@&${roleId}>`).join('\n')}\n_ _`;
			}
			else
			{
				desc = `${check} **Account linked!**`;
			}

			return interaction.followUp({ embeds: [createMsg({ desc: desc })] });
		}
		catch (e)
		{
			if (e.message === Errors.PLAYER_DOES_NOT_EXIST) { return interaction.followUp({ embeds: [invalidIGN] }); }
			console.log(e); 
		}
	}
});