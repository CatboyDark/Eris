const { createMsg } = require('../../../helper/builder.js');
const hypixel = require('../../../helper/hapi.js');
const { Errors } = require('hypixel-api-reborn');
const db = require('../../../mongo/schemas.js');
const { readConfig, writeConfig } = require('../../../helper/configUtils.js');
const { linkMsg, linkButtons, createButtons, linkFeaturesMsg, linkChannelButton, back, linkHelpMsg } = require('./assets.js');

async function setLinkChannel(interaction)
{
	const input = await interaction.fields.getTextInputValue('setLinkChannelInput');
	const channel = await interaction.guild.channels.fetch(input).catch(() => null);
	if (!channel) return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid Channel ID!**' })], ephemeral: true });

	await channel.send({ embeds: [linkMsg], components: [linkButtons] });
	interaction.reply({ embeds: [createMsg({ desc: `Link Channel has been set to **<#${input}>**.` })], ephemeral: true });
}

async function setLinkRole(interaction)
{
	const input = await interaction.fields.getTextInputValue('setLinkRoleInput');
	const role = interaction.guild.roles.cache.get(input);
	if (!role) return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid Role ID!**' })], ephemeral: true });

	const data = readConfig();
	data.features.linkRole = input;
	writeConfig(data);
	interaction.reply({ embeds: [createMsg({ desc: `**Link Role have been set to** <@&${input}>` })], ephemeral: true });
}

async function setGuildRole(interaction)
{
	const input = await interaction.fields.getTextInputValue('setGuildRoleInput');
	const role = interaction.guild.roles.cache.get(input);
	if (!role) return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid Role ID!**' })], ephemeral: true });

	const data = readConfig();
	data.features.guildRole = input;
	writeConfig(data);
	interaction.reply({ embeds: [createMsg({ desc: `**Guild Role have been set to** <@&${input}>` })], ephemeral: true });
}


async function accountLinking(interaction)
{
	const config = readConfig();
	const { customId } = interaction;

	if (customId === 'linkRoleToggle') 
	{
		if (!config.features.linkRole) return interaction.reply({ embeds: [createMsg({ desc: '**You need to set a link role first!**', ephemeral: true })] });
	} 
	else if (customId === 'guildRoleToggle') 
	{
		if (!config.features.guildRole) return interaction.reply({ embeds: [createMsg({ desc: '**You need to set a guild role first!**', ephemeral: true })] });
	}

	const { linkRoleButtons, guildRoleButtons } = await createButtons(interaction);

	await interaction.update({ embeds: [linkFeaturesMsg], components: [linkChannelButton, linkRoleButtons, guildRoleButtons, back] });
}

async function linkHelp(interaction)
{
	await interaction.reply({ embeds: [linkHelpMsg], ephemeral: true });
}

async function link(interaction)
{
	await interaction.deferReply({ ephemeral: true });

	const input = interaction.fields.getTextInputValue('linkInput');

	try
	{
		const config = readConfig();

		const player = await hypixel.getPlayer(input);
		const discord = await player.socialMedia.find(media => media.id === 'DISCORD');
		if (!discord) return interaction.followUp({ embeds: [createMsg({ color: 'FF0000', title: 'Discord is not linked!', desc: 'Click on **How To Link** for more info.', ephemeral: true })] });
		if (interaction.user.username !== discord.link) return interaction.followUp({ embeds: [createMsg({ color: 'FF0000', desc: '**Discord does not match!**\n_ _\nClick on **How To Link** for more info.', ephemeral: true })] });

		try 
		{
			await db.Link.create({ uuid: player.uuid, dcid: interaction.user.id });
		} 
		catch (error) 
		{
			if (error.code === 11000) return interaction.followUp({ embeds: [createMsg({ desc: '**You are already linked!**' })] });
		}

		try { await interaction.member.setNickname(player.nickname); } 
		catch (e) { if (e.message.includes('Missing Permissions')) { interaction.followUp({ embeds: [createMsg({ color: 'FFA500', desc: '**Silly! I cannot change the nickname of the server owner!**' })] }); console.log(e); } }

		if (config.features.linkRoleToggle) await interaction.member.roles.add(config.features.linkRole);
		if (config.features.guildRoleToggle) 
		{
			const guild = await hypixel.getGuild('player', player.uuid);
			if (guild && guild.name === config.guild) await interaction.member.roles.add(config.features.guildRole);
		}

	}
	catch (e)
	{
		if (e.message === Errors.PLAYER_DOES_NOT_EXIST) { return interaction.followUp({ embeds: [createMsg({ color: 'FF0000', desc: '**Invalid Username!**', ephemeral: true })] }); }
		console.log(e); 
	}

	await interaction.followUp({ embeds: [createMsg({ desc: '<:gcheck:1244687091162415176> **Account linked!**' })], ephemeral: true });
}

module.exports =
{
	accountLinking,
	setLinkChannel,
	setLinkRole,
	setGuildRole,
	linkHelp,
	link
};