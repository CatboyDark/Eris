const { createMsg, createRow } = require('../../helper/builder.js');
const { readConfig } = require('../../helper/configUtils.js');
const { newColors } = require('../../helper/dynamicButtons.js');

const loggingMsg = createMsg({
	title: 'Logging',
	desc:
        '**Configure what events will be sent to the Logs channel.**\n\n' +
        '1. `Commands`: Log commands ran\n' +
        '2. `Buttons`: Log buttons pressed\n' +
		'2. `Menus`: Log select menu options pressed\n' +
        '3. `Forms`: Log forms submitted'
});

async function createButtons(interaction) 
{
	const color = await newColors(interaction);
	
	const logButtons = createRow([
		{ id: 'logCommandsToggle', label: 'Log Commands', style: color['logCommandsToggle'] },
		{ id: 'logButtonsToggle', label: 'Log Buttons', style: color['logButtonsToggle'] },
		{ id: 'logMenusToggle', label: 'Log Menus', style: color['logMenusToggle'] },
		{ id: 'logFormsToggle', label: 'Log Forms', style: color['logFormsToggle'] }
	]);

	const backRow = createRow([
		{ id: 'backToSetup', label: 'Back', style: 'Gray' },
		{ id: 'logsToggle', label: 'Enable Logging', style: color['logsToggle'] }
	]);

	return { logButtons, backRow };
}

async function logging(interaction) 
{
	const config = readConfig();

	if (!config.logsChannel)
	{
		interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**You must add a logs channel first!**', ephemeral: true })] });
	}
	else
	{
		const { logButtons, backRow } = await createButtons(interaction);
		interaction.update({ embeds: [loggingMsg], components: [logButtons, backRow] });
	}
}

module.exports = { logging };
