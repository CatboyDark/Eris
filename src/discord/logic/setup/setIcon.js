import { createForm, createMsg } from '../../../helper/builder.js';
import { readConfig, writeConfig } from '../../../helper/utils.js';

async function setIcon(interaction)
{
	if (!interaction.isModalSubmit())
	{
		const modal = createForm({
			id: 'setIconForm',
			title: 'Set Icon',
			components: [
				{
					id: 'setIconInput',
					label: 'IMAGE LINK:',
					style: 'short',
					required: true
				}
			]
		});

		return interaction.showModal(modal);
	}

	const input = interaction.fields.getTextInputValue('setIconInput');
	if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(input))
	{
		return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**Invalid URL!**\n\nDiscord supports: **.jpg .jpeg .png .gif .webp**' })], ephemeral: true });
	}

	const config = readConfig();
	config.icon = input;
	writeConfig(config);

	await interaction.reply({ embeds: [createMsg({ desc: '**Icon has been updated!**' })], ephemeral: true });
	await interaction.followUp({ content: input, ephemeral: true });
}

export default 
{
	setIcon
};
