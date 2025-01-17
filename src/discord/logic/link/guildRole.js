import { createForm, createRow } from '../../../helper/builder.js';
import { writeConfig, toggleConfig, readConfig } from '../../../helper/utils.js';

function createButtons() {
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

async function guildRoleToggle(interaction) {
	const config = readConfig();

	if (!config.features.guildRoleToggle) {
		if (!interaction.isModalSubmit()) {
			const modal = createForm({
				id: 'guildRoleToggle',
				title: 'Set Guild Role',
				components: [
					{
						id: 'setGuildRoleInput',
						label: 'GUILD ROLE ID:',
						style: 'short',
						required: true
					}
				]
			});

			return interaction.showModal(modal);
		}

		const input =
			await interaction.fields.getTextInputValue('setGuildRoleInput');
		const role = interaction.guild.roles.cache.get(input);
		if (!role) {
			return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**That\'s not a valid Role ID!**' })], ephemeral: true });
		}

		config.features.guildRole = input;
		writeConfig(config);
	}

	toggleConfig('features.guildRoleToggle');
	const roleButtons = createButtons(interaction);
	await interaction.update({ components: [roleButtons, back] });
}

export default 
{
	guildRoleToggle
};
