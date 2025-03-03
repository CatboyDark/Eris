import { createForm, createMsg } from '../../../helper/builder.js';
import { createLinkMsg, linkButtons } from './link.js';

async function setLinkChannel(interaction) {
	if (!interaction.isModalSubmit()) {
		const modal = createForm({
			id: 'setLinkChannelForm',
			title: 'Set Link Channel',
			components: [
				{
					id: 'setLinkChannelInput',
					label: 'CHANNEL ID:',
					style: 'short',
					required: true
				}
			]
		});

		return interaction.showModal(modal);
	}

	const input = await interaction.fields.getTextInputValue('setLinkChannelInput');
	const channel = await interaction.guild.channels.fetch(input).catch(() => null);
	if (!channel) {
		return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**That\'s not a valid Channel ID!**' })], ephemeral: true });
	}

	await channel.send({
		embeds: [await createLinkMsg()],
		components: [linkButtons]
	});
	interaction.reply({
		embeds: [
			createMsg({ desc: `**Link Channel has been set to** <#${input}>` })
		],
		ephemeral: true
	});
}

export default 
{
	setLinkChannel
};
