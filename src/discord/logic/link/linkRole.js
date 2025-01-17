import { createForm, createRow } from '../../../helper/builder.js';
import { readConfig, writeConfig, toggleConfig } from '../../../helper/utils.js';

async function createButtons() {
	const config = readConfig();

	const roleButtons = createRow([
		{ id: 'setLinkChannel', label: 'Set Channel', style: 'Blue' },
		{
			id: 'linkRoleToggle',
			label: 'Toggle Link Role',
			style: config.features.linkRoleToggle
		},
		{
			id: 'guildRoleToggle',
			label: 'Toggle Guild Role',
			style: config.features.guildRoleToggle
		}
	]);
	return roleButtons;
}

const back = createRow([{ id: 'features', label: 'Back', style: 'Gray' }]);

async function linkRoleToggle(interaction) {
	const config = readConfig();

	if (!config.features.linkRoleToggle) {
		if (!interaction.isModalSubmit()) {
			const modal = createForm({
				id: 'linkRoleToggle',
				title: 'Set Link Role',
				components: [
					{
						id: 'setLinkRoleInput',
						label: 'LINK ROLE ID:',
						style: 'short',
						required: true
					}
				]
			});

			return interaction.showModal(modal);
		}

		const input =
			await interaction.fields.getTextInputValue('setLinkRoleInput');
		const role = interaction.guild.roles.cache.get(input);
		if (!role) {
			return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**That\'s not a valid Role ID!**' })], ephemeral: true });
		}

		config.features.linkRole = input;
		writeConfig(config);
	}

	toggleConfig('features.linkRoleToggle');
	const roleButtons = await createButtons(interaction);
	await interaction.update({ components: [roleButtons, back] });
}

export default 
{
	linkRoleToggle
};
