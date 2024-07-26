const { createMsg, createRow } = require('../../helper/builder.js');

const featuresMsg = createMsg({
	title: 'Features',
	desc: 
		'1. **Welcome** (Message, Role)\n' +
		'What happens when someone joins your Discord server?\n\n' +

		'2.'
});

const featuresMenu = createRow([
	{ 
		id: 'featuresMenu',
		placeholder: 'Select a feature',
		options:
		[
			{ value: 'setWelcome', label: 'Welcome', desc: 'What happens when someone joins your Discord server?' }
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