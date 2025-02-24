import { restart } from '../commands/slash/restart.js';

export default {
	id: 'restart',

	async execute(interaction) {
		await interaction.deferReply();
		await restart();
		await interaction.followUp({ embeds: [createMsg({ desc: `**Successfully updated ${interaction.client.user.username}!**` })] });
	}
};
