import { createMsg, createRow } from '../../../helper/builder.js';
import { readConfig, toggleConfig } from '../../../helper/utils.js';

async function createButtons()
{
	const config = readConfig();
	const logButtons = createRow([
		{
			id: 'logCommandsToggle',
			label: 'Log Commands',
			style: config.logs.commands
		},
		{
			id: 'logButtonsToggle',
			label: 'Log Buttons',
			style: config.logs.buttons
		},
		{ id: 'logMenusToggle', label: 'Log Menus', style: config.logs.menus },
		{ id: 'logFormsToggle', label: 'Log Forms', style: config.logs.forms }
	]);

	const backRow = createRow([
		{ id: 'backToSetup', label: 'Back', style: 'Gray' },
		{ id: 'logsToggle', label: 'Enable Logs', style: config.logs.enabled }
	]);

	return { logButtons, backRow };
}

async function logging(interaction)
{
	const config = readConfig();

	if (!config.logsChannel)
	{
		interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**You must add a logs channel first!**' })], ephemeral: true });
	}
	else
	{
		switch (interaction.customId)
		{
			case 'logsToggle':
				toggleConfig('logs.enabled');
				break;

			case 'logCommandsToggle':
				toggleConfig('logs.commands');
				break;

			case 'logButtonsToggle':
				toggleConfig('logs.buttons');
				break;

			case 'logMenusToggle':
				toggleConfig('logs.menus');
				break;

			case 'logFormsToggle':
				toggleConfig('logs.forms');
				break;
		}

		const { logButtons, backRow } = await createButtons();
		interaction.update({
			embeds: [createMsg({
			title: 'Logging',
			desc:
				'**Configure what events are sent to the Logs channel.**\n\n' +
				'1. `Commands`: Log commands run\n' +
				'2. `Buttons`: Log buttons pressed\n' +
				'2. `Menus`: Log select menu options pressed\n' +
				'3. `Forms`: Log forms submitted'
			})],
			components: [logButtons, backRow]
		});
	}
}

export default 
{ 
	logging 
};
