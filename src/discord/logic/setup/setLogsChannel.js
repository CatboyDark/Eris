import { createForm, createMsg } from '../../../helper/builder.js';
import { readConfig, writeConfig } from '../../../helper/utils.js';

async function setLogsChannel(interaction)
{
	if (!interaction.isModalSubmit())
	{
		const modal = createForm({
			id: 'setLogsChannelForm',
			title: 'Set Logs Channel',
			components: [
				{
					id: 'setLogsChannelInput',
					label: 'LOGS CHANNEL ID:',
					style: 'short',
					required: true
				}
			]
		});

		return interaction.showModal(modal);
	}

	const input = interaction.fields.getTextInputValue('setLogsChannelInput');
	const channel = await interaction.guild.channels.fetch(input).catch(() => null);
	if (!channel)
	{
		return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**That\'s not a valid Channel ID!**' })], ephemeral: true });
	}

	const config = readConfig();
	config.logsChannel = input;
	config.serverID = interaction.guild.id;
	writeConfig(config);

	interaction.reply({ embeds: [ createMsg({ desc: `**Logs Channel has been set to** <#${input}>` })], ephemeral: true });
}

export default 
{
	setLogsChannel
};
