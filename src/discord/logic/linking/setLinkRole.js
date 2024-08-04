const { createModal, createMsg } = require('../../../helper/builder.js');
const { readConfig, writeConfig } = require('../../../helper/configUtils.js');

async function setLinkRole(interaction)
{
	if (!interaction.isModalSubmit())
	{
		const modal = createModal({
			id: 'setLinkRoleForm',
			title: 'Set Link Role',
			components: [{
				id: 'setLinkRoleInput',
				label: 'LINK ROLE ID:',
				style: 'short',
				required: true
			}]
		});
		
		return interaction.showModal(modal);
	}

	const input = await interaction.fields.getTextInputValue('setLinkRoleInput');
	const role = interaction.guild.roles.cache.get(input);
	if (!role) return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid Role ID!**' })], ephemeral: true });

	const data = readConfig();
	data.features.linkRole = input;
	writeConfig(data);
	interaction.reply({ embeds: [createMsg({ desc: `**Link Role have been set to** <@&${input}>` })], ephemeral: true });
}

module.exports =
{
	setLinkRole
};