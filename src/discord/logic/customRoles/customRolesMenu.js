const { createMsg, createRow } = require('../../../helper/builder.js');

const customRolesMsg = createMsg({
	title: 'Custom Roles',
	desc:
		'Assign roles when a user links their Discord or runs `/roles`.\n\n' +

		'1. **Level**\n' +
		'Assign roles based on the user\'s Skyblock level.\n\n' +

		'2. **Networth**\n' +
		'Assign roles based on the user\'s networth.\n\n' +

		'3. **Skill**\n' +
		'Assign roles based on the user\'s skills.\n\n' +

		'4. **Dungeons**\n' +
		'Assign roles based on the user\'s Catacombs level.'
});

const customRolesMenu = createRow([
	{ 
		id: 'customRolesMenu',
		placeholder: 'Enable custom roles',
		options:
		[
			{ value: 'levelRoles', label: 'Level Roles', desc: 'Skyblock level' },
			{ value: 'nwRoles', label: 'Networth Roles', desc: 'Skyblock networth' },
			{ value: 'skillRoles', label: 'Skill Roles', desc: 'Skyblock skills' },
			{ value: 'dungeonRoles', label: 'Dungeon Roles', desc: 'Skyblock Catacombs level' }
		]
	}
]);

const back = createRow([
	{ id: 'features', label: 'Back', style: 'Gray' }
]);

async function customRoles(interaction)
{
	await interaction.update({ embeds: [customRolesMsg], components: [customRolesMenu, back] });
}

module.exports =
{
	customRoles
};