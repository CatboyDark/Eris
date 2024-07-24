const { createModal, createMsg, createRow } = require('../../builder.js');

const welcomeMsg = createMsg({
	title: 'Welcome',
	desc:
		'1. **Welcome Message**\n' +
		'Send a message when a member joins your Discord server.\n' +
		'If you do not provide a message, the default will be used.\n\n' +

		'2. **Welcome Role**\n' +
		'Assign members a role when they join your Discord server.\n' +
		'You can also choose to remove this role on linking their account to Hypixel.'
});

const welcomeMsgButtons = createRow([
	{ id: 'welcomeMsgToggle', label: 'Toggle Welcome Message', style: 'Green' },
	{ id: 'welcomeChannel', label: 'Set Channel', style: 'Blue' },
	{ id: 'welcomeMsg', label: 'Set Message', style: 'Blue' }
]);

const welcomeRoleButtons = createRow([
	{ id: 'welcomeRoleToggle', label: 'Toggle Welcome Role', style: 'Green' },
	{ id: 'welcomeRole', label: 'Set Role', style: 'Blue' },
	{ id: 'removeRoleOnLink', label: 'Remove Role On Link', style: 'Green' }
]);

const back = createRow([
	{ id: 'backToFeatures', label: 'Back', style: 'Gray' }
]);

async function welcome(interaction)
{
	interaction.update({ embeds: [welcomeMsg], components: [welcomeMsgButtons, welcomeRoleButtons, back] });
}

module.exports = 
{
	welcome
};