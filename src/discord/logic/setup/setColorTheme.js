import { createForm, createMsg } from '../../../helper/builder.js';
import { readConfig, writeConfig } from '../../../helper/utils.js';

async function setColorTheme(interaction)
{
	if (!interaction.isModalSubmit())
	{
		const modal = createForm({
			id: 'setColorThemeForm',
			title: 'Set Color Theme',
			components: [
				{
					id: 'setColorThemeInput',
					label: 'HEX COLOR (EX: \'FFFFFF\'):',
					style: 'short',
					required: true
				}
			]
		});

		return interaction.showModal(modal);
	}

	const input = interaction.fields
		.getTextInputValue('setColorThemeInput')
		.trim();
	const hexRegex = /^[0-9a-fA-F]{6}$/;
	if (!hexRegex.test(input))
	{
		return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**That\'s not a valid HEX color!**' })], ephemeral: true });
	}

	const config = readConfig();
	config.colorTheme = input;
	writeConfig(config);
	interaction.reply({ embeds: [ createMsg({ desc: `Color Theme has been set to **${input}**` }) ], ephemeral: true });
}

export default 
{
	setColorTheme
};
