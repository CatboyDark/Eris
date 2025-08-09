import { helpMCcommands } from '../../buttons/help.js';
export default {
	name: 'help',
	desc: 'Display bot info',

	async execute(interaction) {
		interaction.reply(helpMCcommands);
	}
};
