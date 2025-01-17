import { setupMsg, setupButtons } from '../../logic/setup/menuSetup.js';

export default
{
	name: 'setup',
	desc: 'Bot setup',
	permissions: ['ManageGuild'],

	async execute(interaction) {
		await interaction.reply({ embeds: [setupMsg], components: [setupButtons], ephemeral: true });
	}
};
