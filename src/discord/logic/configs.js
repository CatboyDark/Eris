const { createMsg, createButtons, createRow, createModal } = require('./../../builder.js');
const { readConfig, writeConfig } = require('../../configUtils.js');

const startMsg = createMsg({ 
	description:
		'## Getting Started\n\n' +
    	'**Hello!** Thank you for using Eris!\n\n' +
    	'This command edits the **config.json** file in your bot folder.\n' +
    	'You can manually adjust these settings anytime.\n\n' +
    	'Let\'s start by filling out the Configs for the bot to function.'
});

const startButtons = createRow
([
	{ id: 'configs', label: 'Configs', style: 'SUCCESS' },
	{ id: 'features', label: 'Features', style: 'SUCCESS' }
]);

const configsEmbeds = 
[
	createMsg({
		description: '### Guild\n*Required*\n\n' +
                     'Enter your EXACT guild name.\n\n' +
                     '*Note: wristspasm ≠ WristSpasm*'
	}),
	createMsg({
		description: '### Server ID\n*Required*\n\n' +
                     'Enter your Discord server ID.'
	}),
	createMsg({
		description: '### Staff Roles\n*Required*\n\n' +
                     'Enter your staff role IDs.\n' +
                     'If you have more than one staff role, separate them using a space.\n\n' +
                     '*Note: Staff will be able to:*\n' +
                     '- *Delete messages*\n' +
                     '- *Assign roles below their own role*'
	}),
	createMsg({
		description: '### Guild Icon\n*Optional*\n\n' +
                     'Link an image of your guild icon. If you don\'t, a default will be provided.'
	}),
	createMsg({
		description: '### Color Theme\n*Optional*\n\n' +
                     'Enter a 6 digit HEX.\n' +
                     'This will be used as the main bot color.'
	}),
	createMsg({
		description: '### Yay! Your bot is now functional!\n' +
                     'Next, why don\'t you check out some features?'
	})
];

function configsButtons(index) 
{
	const buttons = createRow([ { id: 'back', label: '<', style: 'Success' } ]);

	if (index === 0) { buttons.addComponents(createButtons({ id: 'setGuild', label: 'Guild', style: 'Primary' })); }
	if (index === 1) { buttons.addComponents(createButtons({ id: 'setServerID', label: 'Server ID', style: 'Primary' })); }
	if (index === 2) { buttons.addComponents(createButtons({ id: 'setStaffRole', label: 'Staff Role(s)', style: 'Primary' })); }
	if (index === 3) { buttons.addComponents(createButtons({ id: 'setGuildIcon', label: 'Guild Icon', style: 'Primary' })); }
	if (index === 4) { buttons.addComponents(createButtons({ id: 'setColorTheme', label: 'Color Theme', style: 'Primary' })); }

	if (index < configsEmbeds.length - 1) { buttons.addComponents(createButtons({ id: 'next', label: '>', style: 'Success' })); }
	if (index === configsEmbeds.length - 1) { buttons.addComponents(createButtons({ id: 'features', label: 'Features', style: 'Primary' })); }

	return buttons;
}

const configsState = { index: 0 };

async function configs(interaction) 
{
	configsState.index = 0;
	const buttons = configsButtons(configsState.index);
	await interaction.update({ embeds: [configsEmbeds[0]], components: [buttons] });
}

async function next(interaction) 
{
	configsState.index++;
	const buttons = configsButtons(configsState.index);
	await interaction.update({ embeds: [configsEmbeds[configsState.index]], components: [buttons] });
}

async function back(interaction) 
{
	if (configsState.index === 0) 
	{ await interaction.update({ embeds: [startMsg()], components: [startButtons] }); } 
	else 
	{
		configsState.index--;
		const buttons = configsButtons(configsState.index);
		await interaction.update({ embeds: [configsEmbeds[configsState.index]], components: [buttons] });
	}
}

async function setGuild(interaction)
{
	const modal = createModal({
		id: 'setGuildForm',
		title: 'Set Guild',
		components: [{
			id: 'setGuildInput',
			label: 'ENTER YOUR GUILD:',
			style: 'SHORT',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function setGuildLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setGuildInput');
	let data = readConfig();
	data.guild = input;
	writeConfig(data);
	interaction.reply({ content: `Guild has been set to: ${input}`, ephemeral: true });
}

async function setServerID(interaction) 
{
	const modal = createModal({
		id: 'setServerIDForm',
		title: 'Set Server ID',
		components: [{
			type: 'textInput',
			id: 'setServerIDInput',
			label: 'ENTER YOUR SERVER ID:',
			style: 'SHORT',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function setServerIDLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setServerIDInput');
	let data = readConfig();
	data.serverID = input;
	writeConfig(data);
	interaction.reply({ content: `Server ID has been set to: ${input}`, ephemeral: true });
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
			style: 'SHORT',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function setStaffRoleLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setStaffRoleInput');
	const roleIDs = input.split(' ');
	let data = readConfig();
	data.staffRole = roleIDs;
	writeConfig(data);
	interaction.reply({ content: `Staff Role(s) has been set to:\n${roleIDs.join('\n')}`, ephemeral: true });
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
			style: 'SHORT',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function setGuildIconLogic(interaction) 
{
	const input = interaction.fields.getTextInputValue('setGuildIconInput');
	let data = readConfig();
	data.guildIcon = input;
	writeConfig(data);
	interaction.reply({ content: `Guild Icon has been set to:\n${input}`, ephemeral: true });
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
			style: 'SHORT',
			required: true
		}]
	});
	
	await interaction.showModal(modal);
}

async function setColorThemeLogic(interaction) {
	const input = interaction.fields.getTextInputValue('setColorThemeInput');
	let data = readConfig();
	data.colorTheme = input;
	writeConfig(data);
	interaction.reply({ content: `Color Theme has been set to: #${input}`, ephemeral: true });
}

module.exports = 
{ 
	configs, 
	next, 
	back, 
	setGuild, 
	setGuildLogic, 
	setServerID, 
	setServerIDLogic, 
	setStaffRole, 
	setStaffRoleLogic, 
	setGuildIcon, 
	setGuildIconLogic, 
	setColorTheme, 
	setColorThemeLogic 
};