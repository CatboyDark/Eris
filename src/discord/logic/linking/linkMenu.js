const { createMsg, createRow } = require('../../../helper/builder.js');
const { readConfig } = require('../../../helper/configUtils.js');
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

module.exports =
{
	accountLinking
};