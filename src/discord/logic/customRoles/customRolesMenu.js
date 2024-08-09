const { createMsg, createRow } = require('../../../helper/builder.js');
const { readConfig } = require('../../../helper/configUtils.js');

const customRolesMsg = createMsg({
	title: 'Custom Roles',
	desc:
		'Assign custom roles when a member links their Discord or runs `/roles`.\n\n' +

		'1. **Level**\n' +
		'Assign roles based on the user\'s Skyblock level.\n\n' +

		'2. **Networth**\n' +
		'Assign roles based on the user\'s networth.\n\n' +

		'3. **Skill**\n' +
		'Assign roles based on the user\'s skills.\n\n' +

		'4. **Dungeons**\n' +
		'Assign roles based on the user\'s Catacombs level.'
});

async function createButtons()
{
	const config = readConfig();
	const customRolesButtons = createRow([
		{ id: 'sbLevelRoleToggle', label: 'Toggle Link Role', style: config.features.sbLevelRoleToggle }
	]);

	return customRolesButtons;
}

const createMenu = createRow([
	{ 
		id: 'customRolesMenu',
		placeholder: 'Set roles IDs',
		options:
		[
			{ value: 'welcome', label: 'Welcome', desc: 'What happens when someone joins your Discord server?' },
			{ value: 'accountLinking', label: 'Account Linking', desc: 'Discord-Hypixel linking system' },
			{ value: 'customRoles', label: 'Custom Roles', desc: 'Custom Skyblock Roles (Requires Hypixel Linking)' }
		]
	}
]);

const back = createRow([
	{ id: 'backToFeatures', label: 'Back', style: 'Gray' }
]);