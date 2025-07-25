import { createMsg } from '../../../utils/utils.js';

export default {
	name: 'setstats',
	desc: 'Setup stats channels',
	permissions: 0,

	async execute(interaction) {
		interaction.reply(createMsg([{ embed: [
			{ desc: '### Setup Stats Channels' },
			{
				id: 'setStats',
				label: 'Select your channels',
				multi: [0, 2],
				options: [
					{ id: 'guildLevel', label: 'Guild Level' },
					{ id: 'guildMembers', label: 'Guild Members' }
				]
			}
		]}], { ephemeral: true }));
	}
};
