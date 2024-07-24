const { createMsg, createRow, createModal } = require('./../../builder.js');
const { readConfig, writeConfig } = require('../../configUtils.js');
const { startMsg, startButtons } = require('../cmds/slash/setup.js');

const configsMsg = createMsg({
	title: 'Configs',
	desc: 
		'1. **Guild**\n' +
        'Enter your EXACT guild name (wristspasm ≠ WristSpasm)\n\n' +

		'2. **Staff Roles**\n' +
    	'Enter your staff role ID\n' +
        'Every role above staff role will be added automatically.\n\n' +
        '*Note: Staff will be able to:*\n' +
        '- *Delete messages*\n' +
        '- *Assign roles below their own role*\n\n' +

		'3. **Logs Channel**\n' +
		'Enter a channel ID for bot logs\n\n' +

		'3. **Guild Icon**\n' +
        'Link an image of your guild icon. If you don\'t, a default will be used.\n\n' +

		'4. **Color Theme**\n\n' +
        'Enter a 6 digit HEX.\n' +
        'This will be used as the main bot color.'
});

const configsMenu = createRow([
	{
		id: 'configsMenu',
		placeholder: 'Select a config',
		options:
		[
			{ value: 'setGuild', label: 'Guild', desc: 'Required' },
			{ value: 'setStaffRole', label: 'Staff Roles', desc: 'Required' },
			{ value: 'setLogsChannel', label: 'Logs Channel', desc: 'Optional' },
			{ value: 'setGuildIcon', label: 'Guild Icon', desc: 'Optional' },
			{ value: 'setColorTheme', label: 'Color Theme', desc: 'Optional' }
		]
	}
]);

const back = createRow([
	{ id: 'backToSetup', label: 'Back', style: 'Gray' }
]);

async function setGuild(interaction)
{
	const modal = createModal({
		id: 'setGuildForm',
		title: 'Set Guild',
		components: [{
			id: 'setGuildInput',
			label: 'ENTER YOUR GUILD:',
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
			label: 'ENTER A STAFF ROLE ID:',
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
			label: 'ENTER A LOGS CHANNEL ID:',
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
			label: 'LINK AN IMAGE:',
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
			label: 'ENTER A HEX COLOR (EX: \'FFFFFF\'):',
			style: 'short',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function configs(interaction) 
{
	await interaction.update({ embeds: [configsMsg], components: [configsMenu, back] });
}

async function backToSetup(interaction)
{
	await interaction.update({ embeds: [startMsg], components: [startButtons] });
}

async function setGuildLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setGuildInput');
	const data = readConfig();
	data.guild = input;
	writeConfig(data);
	interaction.reply({ embeds: [createMsg({ desc: `Guild has been set to **${input}**.` })], ephemeral: true });
}

async function setStaffRoleLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setStaffRoleInput');
	const role = interaction.guild.roles.cache.get(input);
	if (!role) 
	{
		interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**hat\'s not a valid role ID!**' })], ephemeral: true });
		return;
	}
	const roleIDs = interaction.guild.roles.cache
		.filter(r => r.position >= role.position)
		.map(r => r.id)
		.sort((a, b) => interaction.guild.roles.cache.get(b).position - interaction.guild.roles.cache.get(a).position);
		
	const data = readConfig();
	data.staffRole = roleIDs;
	writeConfig(data);
	const rolesFormatted = roleIDs.map(roleID => `<@&${roleID}>`).join('\n');
	interaction.reply({ embeds: [createMsg({ desc: `Staff Role(s) have been set to:\n\n${rolesFormatted}` })], ephemeral: true });
}

async function setLogsChannelLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setLogsChannelInput');
	const channel = await interaction.guild.channels.fetch(input).catch(() => null);
	if (!channel) 
	{ 
		interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid channel ID!**', ephemeral: true })] });
		return;
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
		interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid HEX color!**' })], ephemeral: true });
		return;
	}
	const data = readConfig();
	data.colorTheme = input;
	writeConfig(data);
	interaction.reply({ embeds: [createMsg({ desc: `Color Theme has been set to: **${input}**` })], ephemeral: true });
}

module.exports = 
{ 
	configs,
	configsMenu,
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