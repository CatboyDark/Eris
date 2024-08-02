const { createMsg } = require('../../../helper/builder.js');
const { readConfig, writeConfig } = require('../../../helper/configUtils.js');
const { ActivityType } = require('discord.js');
const { startMsg, startButtons } = require('../../logic/configs/assets.js');
const { configsMsg, configsButtons, back } = require('./assets.js');

async function configs(interaction) 
{
	await interaction.update({ embeds: [configsMsg], components: [configsButtons, back] });
}

async function backToSetup(interaction)
{
	await interaction.update({ embeds: [startMsg], components: [startButtons] });
}

async function setGuild(interaction) 
{
	const input = interaction.fields.getTextInputValue('setGuildInput');
	await interaction.client.user.setActivity(`${input}`, {type: ActivityType.Watching});
	const data = readConfig();
	data.guild = input;
	writeConfig(data);
	await interaction.reply({ embeds: [createMsg({ desc: `**Guild has been set to** ${input}` })], ephemeral: true });
}

async function setStaffRole(interaction) 
{
	const input = interaction.fields.getTextInputValue('setStaffRoleInput');
	const role = interaction.guild.roles.cache.get(input);
	if (!role) return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid Role ID!**' })], ephemeral: true });

	const roleIDs = interaction.guild.roles.cache
		.filter(r => r.position >= role.position)
		.map(r => r.id)
		.sort((a, b) => interaction.guild.roles.cache.get(b).position - interaction.guild.roles.cache.get(a).position);

	const serverID = interaction.guild.id;
	const data = readConfig();
	data.staffRole = roleIDs;
	data.serverID = serverID;
	writeConfig(data);
	const newRoles = roleIDs.map(roleID => `<@&${roleID}>`).join('\n');
	interaction.reply({ embeds: [createMsg({ desc: `Staff Role(s) have been set to:\n\n${newRoles}` })], ephemeral: true });
}

async function setLogsChannel(interaction) 
{
	const input = interaction.fields.getTextInputValue('setLogsChannelInput');
	const channel = await interaction.guild.channels.fetch(input).catch(() => null);
	if (!channel) return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid Channel ID!**' })], ephemeral: true });

	const data = readConfig();
	data.logsChannel = input;
	writeConfig(data);
	interaction.reply({ embeds: [createMsg({ desc: `**Logs Channel has been set to** <#${input}>` })], ephemeral: true });
}

async function setGuildIcon(interaction) 
{
	const input = interaction.fields.getTextInputValue('setGuildIconInput');
	const data = readConfig();
	data.icon = input;
	writeConfig(data);
	await interaction.reply({ embeds: [createMsg({ desc: '**Guild Icon has been updated!**' })], ephemeral: true });
	await interaction.followUp({ content: input, ephemeral: true });
}

async function setColorTheme(interaction) 
{
	const input = interaction.fields.getTextInputValue('setColorThemeInput').trim();
	const hexRegex = /^[0-9a-fA-F]{6}$/;
	if (!hexRegex.test(input)) return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid HEX color!**' })], ephemeral: true });

	const data = readConfig();
	data.colorTheme = input;
	writeConfig(data);
	interaction.reply({ embeds: [createMsg({ desc: `**Color Theme has been set to** ${input}` })], ephemeral: true });
}

module.exports = 
{ 
	configs,
	backToSetup,
	setGuild, 
	setStaffRole,
	setLogsChannel,
	setGuildIcon, 
	setColorTheme 
};