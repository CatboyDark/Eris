const { createMsg, createRow } = require('../../helper/builder.js');

const featuresMsg = createMsg({
	title: 'Features',
	desc: 
		'1. **Welcome** (Message, Role)\n' +
		'What happens when someone joins your Discord server?\n\n' +

		'2. **Hypixel Linking**\n' +
		'Link your Hypixel account to your Discord! (not a scam trust)\n\n' +

		'3. **Custom Roles**\n' +
		'Custom Skyblock roles! (Requires Hypixel Linking)'
});

const featuresMenu = createRow([
	{ 
		id: 'featuresMenu',
		placeholder: 'Select a feature',
		options:
		[
			{ value: 'welcome', label: 'Welcome', desc: 'What happens when someone joins your Discord server?' },
			{ value: 'accountLinking', label: 'Account Linking', desc: 'Discord-Hypixel linking system' },
			{ value: 'customRoles', label: 'Custom Roles', desc: 'Custom Skyblock Roles (Requires Hypixel Linking)' }
		]
	}
]);

const back = createRow([
	{ id: 'backToSetup', label: 'Back', style: 'Gray' }
]);

async function features(interaction)
{
	interaction.update({ embeds: [featuresMsg], components: [featuresMenu, back] });
}

async function backToFeatures(interaction)
{
	interaction.update({ embeds: [featuresMsg], components: [featuresMenu, back] });
}

module.exports = 
{ 
	features,
	backToFeatures,
	featuresMsg,
	featuresMenu
};