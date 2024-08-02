const { createMsg, createRow, createModal } = require('../../../helper/builder.js');
const { newColors } = require('../../../helper/dynamicButtons.js');

const linkFeaturesMsg = createMsg({
	title: 'Account Linking',
	desc:
		'Allow members to enter their IGN to link their Discord with their Hypixel.\n' +
		'**Note**: This is required to enable Custom Roles.\n\n' +

		'1. **Linked Role**\n' +
		'Assign members a role when they link.\n' +
		'You may create a new role or set an existing role as the Linked Role.\n\n' +

		'2. **Guild Role**\n' +
		'Assign members a role if they are in your Guild.\n' +
		'You may create a new role or set an existing role as the Linked Role.'
});

const linkChannelButton = createRow([
	{ id: 'setLinkChannel', label: 'Set Channel', style: 'Green' }
]);

async function createButtons(interaction)
{
	const color = await newColors(interaction);

	const linkRoleButtons = createRow([
		{ id: 'linkRoleToggle', label: 'Toggle Link Role', style: color['linkRoleToggle'] },
		{ id: 'createLinkRole', label: 'Create New Role', style: 'Blue' },
		{ id: 'setLinkRole', label: 'Set Existing Role', style: 'Blue' }
	]);
	
	const guildRoleButtons = createRow([
		{ id: 'guildRoleToggle', label: 'Toggle Guild Role', style: color['guildRoleToggle'] },
		{ id: 'createGuildRole', label: 'Create New Role', style: 'Blue' },
		{ id: 'setGuildRole', label: 'Set Existing Role', style: 'Blue' }
	]);

	return { linkRoleButtons, guildRoleButtons };
}

const back = createRow([
	{ id: 'backToFeatures', label: 'Back', style: 'Gray' }
]);

const linkMsg = createMsg({
	desc:
		'### <:gcheck:1244687091162415176> Link your Account!\n' +
        'Connect your Hypixel account to gain server access.\n' +
        '\n' +
        '*Please contact a staff member if the bot is down or if you require further assistance.*'
});

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

async function setLinkChannelForm(interaction)
{
	const modal = createModal({
		id: 'setLinkChannelForm',
		title: 'Set Link Channel',
		components: [{
			id: 'setLinkChannelInput',
			label: 'CHANNEL ID:',
			style: 'short',
			required: true
		}]
	});
	
	await interaction.showModal(modal); 
}

async function setLinkRoleForm(interaction)
{
	const modal = createModal({
		id: 'setLinkRoleForm',
		title: 'Set Link Role',
		components: [{
			id: 'setLinkRoleInput',
			label: 'LINK ROLE ID:',
			style: 'short',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function setGuildRoleForm(interaction)
{
	const modal = createModal({
		id: 'setGuildRoleForm',
		title: 'Set Guild Role',
		components: [{
			id: 'setGuildRoleInput',
			label: 'GUILD ROLE ID:',
			style: 'short',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function linkForm(interaction)
{
	const modal = createModal({
		id: 'linkForm',
		title: 'Link Your Account',
		components: [{
			id: 'linkInput',
			label: 'ENTER YOUR IGN:',
			style: 'short',
			required: true
		}]
	});
	
	await interaction.showModal(modal); 
}

module.exports =
{
	linkButtons,
	linkHelpMsg,
	linkMsg,
	back,
	createButtons,
	linkChannelButton,
	linkFeaturesMsg,
	setLinkChannelForm,
	setLinkRoleForm,
	setGuildRoleForm,
	linkForm
};