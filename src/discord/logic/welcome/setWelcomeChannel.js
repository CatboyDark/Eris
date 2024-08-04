const { createModal, createMsg } = require('../../../helper/builder.js');
const { readConfig, writeConfig } = require('../../../helper/configUtils.js');

async function setWelcomeChannel(interaction)
{
	if (!interaction.isModalSubmit())
	{
		const modal = createModal({
			id: 'setWelcomeChannelForm',
			title: 'Set Welcome Channel',
			components: [{
				id: 'setWelcomeChannelInput',
				label: 'CHANNEL ID:',
				style: 'short',
				required: false
			}]
		});
		
		return interaction.showModal(modal);
	}

	const input = interaction.fields.getTextInputValue('setWelcomeChannelInput');
	const channel = await interaction.guild.channels.fetch(input).catch(() => null);
	if (!channel) 
	{ 
		return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid channel ID!**' })], ephemeral: true });
	}
	const data = readConfig();
	data.features.welcomeChannel = input;
	writeConfig(data);
	interaction.reply({ embeds: [createMsg({ desc: `Welcome Channel has been set to **<#${input}>**.` })], ephemeral: true });
}

module.exports = 
{
	setWelcomeChannel
};