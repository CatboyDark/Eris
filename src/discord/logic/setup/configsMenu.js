const { createMsg, createRow } = require('../../../helper/builder.js');

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

		'3. **Logs Channel** *Highly Recommended*\n' +
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

async function configs(interaction) 
{
	await interaction.update({ embeds: [configsMsg], components: [configsButtons, back] });
}

module.exports = 
{ 
	configsMsg,
	configsButtons,
	configs
};