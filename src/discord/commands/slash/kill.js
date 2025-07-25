import { createMsg } from '../../../utils/utils.js';

export default {
	name: 'kill',
	desc: 'Kill the bot',
	permissions: 0,

	async execute(interaction) {
		await interaction.reply(createMsg([{ embed: [{ desc: `**${interaction.client.user.username} has been killed :(**` }] }], { ephemeral: true }));
		console.cyan(`${interaction.client.user.username} has been killed by @${interaction.user.username} :(`);

		process.exit(0);
	}
};
