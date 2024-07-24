const { createMsg, createRow, createModal } = require('./../../builder.js');
const { readConfig, writeConfig } = require('../../configUtils.js');

const configsMsg = createMsg({
	title: 'Configs',
	desc: 
		'1. **Guild**\n' +
        'Enter your EXACT guild name (wristspasm ≠ WristSpasm)\n\n' +

		'2. **Staff Roles** *Required*\n' +
    	'Enter your staff role ID\n' +
        'Every role above staff role will be added automatically.\n\n' +
        '*Note: Staff will be able to:*\n' +
        '- *Delete messages*\n' +
        '- *Assign roles below their own role*\n\n' +

		'3. **Guild Icon** *Optional*\n' +
        'Link an image of your guild icon. If you don\'t, a default will be used.\n\n' +

		'4. **Color Theme** *Optional*\n\n' +
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
			{ value: 'setServerID', label: 'Server ID', desc: 'Required' },
			{ value: 'setStaffRole', label: 'Staff Roles', desc: 'Required' },
			{ value: 'setGuildIcon', label: 'Guild Icon', desc: 'Optional' },
			{ value: 'setColorTheme', label: 'Color Theme', desc: 'Optional' }
		]
	}
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
			type: 'textInput',
			id: 'setStaffRoleInput',
			label: 'SEPARATE STAFF ROLE IDS USING A SPACE:',
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
			type: 'textInput',
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
			type: 'textInput',
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
	await interaction.update({ embeds: [configsMsg], components: [configsMenu] });
}

async function setGuildLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setGuildInput');
	const data = readConfig();
	data.guild = input;
	writeConfig(data);
	interaction.reply({ content: `Guild has been set to: ${input}`, ephemeral: true });
}

async function setStaffRoleLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setStaffRoleInput');
	const role = interaction.guild.roles.cache.get(input);
	if (!role) 
	{
		interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: 'That\'s not a valid role ID!' })], ephemeral: true });
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
	interaction.reply({ embeds: [createMsg({ color: '00FF00', desc: `Staff Role(s) have been set to:\n${rolesFormatted}` })], ephemeral: true });

}

async function setGuildIconLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setGuildIconInput');
	const data = readConfig();
	data.guildIcon = input;
	writeConfig(data);
	interaction.reply({ content: `Guild Icon has been set to:\n${input}`, ephemeral: true });
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
	setGuild, 
	setGuildLogic, 
	setStaffRole, 
	setStaffRoleLogic, 
	setGuildIcon, 
	setGuildIconLogic, 
	setColorTheme, 
	setColorThemeLogic 
};