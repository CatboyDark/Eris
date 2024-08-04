const { createModal, createMsg } = require('../../../helper/builder.js');
const { readConfig, writeConfig } = require('../../../helper/configUtils.js');

async function setGuildRole(interaction)
{
	if (!interaction.isModalSubmit())
	{
		const modal = createModal({
			id: 'setGuildRoleForm',
			title: 'Set Guild Role',
			components: [{
				id: 'setGuildRoleInput',
				label: 'GUILD ROLE ID:',
				style: 'short',
				required: true
			}]
		});
		
		return interaction.showModal(modal);
	}

	const input = await interaction.fields.getTextInputValue('setGuildRoleInput');
	const role = interaction.guild.roles.cache.get(input);
	if (!role) return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid Role ID!**' })], ephemeral: true });

	const data = readConfig();
	data.features.guildRole = input;
	writeConfig(data);
	interaction.reply({ embeds: [createMsg({ desc: `**Guild Role have been set to** <@&${input}>` })], ephemeral: true });
}

module.exports =
{
	setGuildRole
};