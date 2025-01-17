import { createMsg } from '../../../helper/builder.js';
import { restart } from '../../logic/other/restart.js';

export default
{
	name: 'restart',
	desc: 'Restarts and updates the bot',
	permissions: ['ManageGuild'],

	async execute(interaction) {
		await interaction.deferReply();
		await restart(interaction.client);

		await interaction.followUp({ embeds: [createMsg({color: 'Red', desc: `**Successfully restarted ${interaction.client.user.username}!**` })] });
	}
};
