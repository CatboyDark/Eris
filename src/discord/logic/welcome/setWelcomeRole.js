import { createForm, createMsg } from '../../../helper/builder.js';
import { readConfig, writeConfig } from '../../../helper/utils.js';

async function setWelcomeRole(interaction)
{
	if (!interaction.isModalSubmit())
	{
		const modal = createForm({
			id: 'setWelcomeRoleForm',
			title: 'Set Welcome Channel',
			components: [
				{
					id: 'setWelcomeRoleInput',
					label: 'ROLE ID:',
					style: 'short',
					required: false
				}
			]
		});

		return interaction.showModal(modal);
	}

	const input = interaction.fields.getTextInputValue('setWelcomeRoleInput');
	const role = interaction.guild.roles.cache.get(input);
	if (!role)
	{
		return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**That\'s not a valid role ID!**' })], ephemeral: true });
	}
	if (interaction.member.roles.highest.comparePositionTo(role) <= 0)
	{
		return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**You do not have permission to assign that role!**' })], ephemeral: true });
	}
	const config = readConfig();
	config.features.welcomeRole = input;
	writeConfig(config);
	interaction.reply({ embeds: [createMsg({ desc: `Welcome Role has been set to ${role}.` })], ephemeral: true });
}

export default 
{
	setWelcomeRole
};
