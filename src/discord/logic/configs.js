const { createMsg, createRow, createModal } = require('../../helper/builder.js');
const { readConfig, writeConfig } = require('../../helper/configUtils.js');
const { startMsg, startButtons } = require('../cmds/slash/setup.js');
const { ActivityType } = require('discord.js');

const configsMsg = createMsg({
	title: 'Configs',
	desc: 
		'1. **Guild** *Required*\n' +
        'Enter your EXACT guild name. (Ex: wristspasm ≠ WristSpasm)\n\n' +

		'2. **Staff Role** *Required*\n' +
    	'Enter your staff role ID.\n' +
        'Every role above staff role will be added automatically.\n\n' +
        '*Note: Staff will be able to:*\n' +
        '- *Delete messages*\n' +
        '- *Assign roles below their own role*\n\n' +

		'3. **Logs Channel**\n' +
		'Enter a channel ID for bot logs.\n\n' +

		'4. **Guild Icon**\n' +
        'Link an image of your guild icon.\n' +
		'If you do not, a default will be used.\n\n' +

		'5. **Color Theme**\n' +
        'Enter a 6 digit HEX.\n' +
        'This will be used as the main bot color.'
});

const configsButtons = createRow([
	{ id: 'setGuild', label: 'Guild', style: 'Blue' },
	{ id: 'setStaffRole', label: 'Staff Roles', style: 'Blue' },
	{ id: 'setLogsChannel', label: 'Logs Channel', style: 'Blue' },
	{ id: 'setGuildIcon', label: 'Guild Icon', style: 'Blue' },
	{ id: 'setColorTheme', label: 'Color Theme', style: 'Blue' }
]);

const backRow = createRow([
	{ id: 'backToSetup', label: 'Back', style: 'Gray' }
]);

async function setGuild(interaction)
{
	const modal = createModal({
		id: 'setGuildForm',
		title: 'Set Guild',
		components: [{
			id: 'setGuildInput',
			label: 'GUILD:',
			style: 'short',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function setStaffRole(interaction) 
{
	const modal = createModal({
		id: 'setStaffRoleForm',
		title: 'Set Staff Role(s)',
		components: [{
			id: 'setStaffRoleInput',
			label: 'STAFF ROLE ID:',
			style: 'short',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function setLogsChannel(interaction) 
{
	const modal = createModal({
		id: 'setLogsChannelForm',
		title: 'Set Logs Channel',
		components: [{
			id: 'setLogsChannelInput',
			label: 'LOGS CHANNEL ID:',
			style: 'short',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function setGuildIcon(interaction) 
{
	const modal = createModal({
		id: 'setGuildIconForm',
		title: 'Set Guild Icon',
		components: [{
			id: 'setGuildIconInput',
			label: 'IMAGE LINK:',
			style: 'short',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function setColorTheme(interaction) 
{
	const modal = createModal({
		id: 'setColorThemeForm',
		title: 'Set Color Theme',
		components: [{
			id: 'setColorThemeInput',
			label: 'HEX COLOR (EX: \'FFFFFF\'):',
			style: 'short',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function configs(interaction) 
{
	await interaction.update({ embeds: [configsMsg], components: [configsButtons, backRow] });
}

async function backToSetup(interaction)
{
	await interaction.update({ embeds: [startMsg], components: [startButtons] });
}

async function setGuildLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setGuildInput');
	await interaction.client.user.setActivity(`${input}`, {type: ActivityType.Watching});
	const data = readConfig();
	data.guild = input;
	writeConfig(data);
	await interaction.reply({ embeds: [createMsg({ desc: `Guild has been set to **${input}**.` })], ephemeral: true });
}

async function setStaffRoleLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setStaffRoleInput');
	const role = interaction.guild.roles.cache.get(input);
	if (!role) 
	{
		return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid Role ID!**' })], ephemeral: true });
	}
	const roleIDs = interaction.guild.roles.cache
		.filter(r => r.position >= role.position)
		.map(r => r.id)
		.sort((a, b) => interaction.guild.roles.cache.get(b).position - interaction.guild.roles.cache.get(a).position);

	const serverID = interaction.guild.id;
	console.log(serverID);
	const data = readConfig();
	data.staffRole = roleIDs;
	data.serverID = serverID;
	writeConfig(data);
	const newRoles = roleIDs.map(roleID => `<@&${roleID}>`).join('\n');
	interaction.reply({ embeds: [createMsg({ desc: `Staff Role(s) have been set to:\n\n${newRoles}` })], ephemeral: true });
}

async function setLogsChannelLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setLogsChannelInput');
	const channel = await interaction.guild.channels.fetch(input).catch(() => null);
	if (!channel) 
	{ 
		return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid Channel ID!**' })], ephemeral: true });
	}
	const data = readConfig();
	data.logsChannel = input;
	writeConfig(data);
	interaction.reply({ embeds: [createMsg({ desc: `Logs Channel has been set to **<#${input}>**.` })], ephemeral: true });
}

async function setGuildIconLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setGuildIconInput');
	const data = readConfig();
	data.guildIcon = input;
	writeConfig(data);
	await interaction.reply({ embeds: [createMsg({ desc: '**Guild Icon has been updated!**' })], ephemeral: true });
	await interaction.followUp({ content: input, ephemeral: true });
}

async function setColorThemeLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setColorThemeInput').trim();
	const hexRegex = /^[0-9a-fA-F]{6}$/;
	if (!hexRegex.test(input)) 
	{
		return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid HEX color!**' })], ephemeral: true });
	}
	const data = readConfig();
	data.colorTheme = input;
	writeConfig(data);
	interaction.reply({ embeds: [createMsg({ desc: `Color Theme has been set to: **${input}**` })], ephemeral: true });
}

module.exports = 
{ 
	configs,
	backToSetup,
	setGuild, 
	setGuildLogic, 
	setStaffRole, 
	setStaffRoleLogic,
	setLogsChannel,
	setLogsChannelLogic,
	setGuildIcon, 
	setGuildIconLogic, 
	setColorTheme, 
	setColorThemeLogic 
};