import { createMsg, getPerms } from '../../utils/utils.js';
import { restart } from '../commands/slash/restart.js';

const restartButton = {
	id: 'restart',

	async execute(interaction) {
		const perms = getPerms(interaction.member);
		if (!perms.includes('RestartBot')) return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: `**You don\'t have permission to restart ${interaction.client.user.displayName}!**` })] });

		await interaction.deferReply();
		await restart();
		await interaction.followUp({ embeds: [createMsg({ desc: `**Successfully updated ${interaction.client.user.displayName}!**` })] });
	}
};

export default [ restartButton ];
