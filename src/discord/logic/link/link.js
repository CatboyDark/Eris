const db = require('../../../mongo/schemas.js');
const Errors = require('hypixel-api-reborn');
const { createMsg, createRow, createModal, createError } = require('../../../helper/builder.js');
const { readConfig, getEmoji, getDiscord, getPlayer, getGuild, getSBLevelHighest } = require('../../../helper/utils.js');

async function createLinkMsg() 
{
	const check = await getEmoji('check');

	const linkMsg = createMsg({
		desc:
            `### ${check} Link your Account!\n` +
            'Enter your IGN to connect your Hypixel account.\n\n' +

            '*Please contact a staff member if the bot is down or if you require further assistance.*'
	});

	return linkMsg;
}

const linkHelpMsg = createMsg({
	title: 'How to Link Your Account',
	desc:
		'1. Connect to __mc.hypixel.net__.\n' +
		'2. Once you\'re in a lobby, click on your head (2nd hotbar slot).\n' +
		'3. Click **Social Media**.\n' +
		'4. Click **Discord**.\n' +
		'5. Type your Discord username into chat.',
	image: 'https://media.discordapp.net/attachments/922202066653417512/1066476136953036800/tutorial.gif'
});

const linkButtons = createRow([
	{ id: 'link', label: 'Link', style: 'Green' },
	{ id: 'linkHelp', label: 'How To Link', style: 'Gray' }
]);

const modal = createModal({
	id: 'linkForm',
	title: 'Link Your Account',
	components: [{
		id: 'linkInput',
		label: 'ENTER YOUR IGN:',
		style: 'short',
		required: true,
		length: [3, 16]
	}]
});

const notLinked = createError('**Discord is not linked!**\n_ _\nClick on **How To Link** for more info.');
const noMatch = createError('**Discord does not match!**\n_ _\nClick on **How To Link** for more info.');
const invalidIGN = createError('**Invalid Username!**');

async function link(interaction)
{
	if (!interaction.isModalSubmit()) return interaction.showModal(modal); 

	const check = await getEmoji('check');
	const plus = await getEmoji('plus');
	const minus = await getEmoji('minus');

	await interaction.deferReply({ ephemeral: true });

	const input = interaction.fields.getTextInputValue('linkInput');

	try
	{
		const config = readConfig();

		const player = await getPlayer(input);
		const discord = await getDiscord(input);
		if (!discord) 
			return interaction.followUp({ embeds: [notLinked] });
		if (interaction.user.username !== discord) 
			return interaction.followUp({ embeds: [noMatch] });

		// Register into DB
		db.Link.create({ uuid: player.uuid, dcid: interaction.user.id }).catch(() => {});

		// Set Nickname
		try 
		{ 
			await interaction.member.setNickname(player.nickname); 
		} 
		catch (e) 
		{ 
			if (e.message.includes('Missing Permissions')) 
			{ 
				interaction.followUp({ embeds: [createMsg({ color: 'FFA500', desc: '**Silly! I cannot change the nickname of the server owner!**' })]});
			} 
		}

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

		// Assign Level Role
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

		return interaction.followUp({ embeds: [createMsg({ desc: desc })], ephemeral: true });
	}
	catch (e)
	{
		if (e.message === Errors.PLAYER_DOES_NOT_EXIST) { return interaction.followUp({ embeds: [invalidIGN] }); }
		console.log(e); 
	}
}

async function linkHelpLogic(interaction)
{
	await interaction.reply({ embeds: [linkHelpMsg] });
}

module.exports = 
{
	createLinkMsg,
	linkButtons,
	link,
	linkHelpLogic
};