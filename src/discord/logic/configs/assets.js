const { createMsg, createRow, createModal } = require('../../../helper/builder.js');

const startMsg = createMsg({
	title: 'Getting Started',
	desc: 
		'**Hello!** Thank you for using Eris.\n\n' +
		'This command edits the **config.json** file in your bot folder.\n' +
		'You can manually adjust these settings anytime.\n\n' +
		'Let\'s start by filling out the required Configs for the bot to function.'
});

const startButtons = createRow([
	{ id: 'configs', label: 'Configs', style: 'Green' },
	{ id: 'features', label: 'Features', style: 'Green' },
	{ id: 'logging', label: 'Logs', style: 'Blue' }
]);

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
	{ id: 'setGuild', label: 'Guild', style: 'Green' },
	{ id: 'setStaffRole', label: 'Staff Roles', style: 'Green' },
	{ id: 'setLogsChannel', label: 'Logs Channel', style: 'Green' },
	{ id: 'setIcon', label: 'Icon', style: 'Green' },
	{ id: 'setColorTheme', label: 'Color Theme', style: 'Green' }
]);

const back = createRow([
	{ id: 'backToSetup', label: 'Back', style: 'Gray' }
]);

async function setGuildForm(interaction)
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

async function setStaffRoleForm(interaction) 
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

async function setLogsChannelForm(interaction) 
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

async function setIconForm(interaction) 
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

async function setColorThemeForm(interaction) 
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

module.exports = 
{ 
	configsMsg,
	configsButtons,
	back,
	setGuildForm, 
	setStaffRoleForm, 
	setLogsChannelForm,
	setIconForm, 
	setColorThemeForm
};