import { execSync } from 'child_process';
import { createMsg } from '../../../utils/utils.js';

export default {
	name: 'restart',
	desc: 'Restart the bot',
	permissions: 0,

	async execute(interaction) {
		try {
			execSync('pm2 restart Eris');
		}
		catch (e) {
			console.error('Error | Restart', e);
		}

		interaction.reply(createMsg([{ embed: [{ desc: '**Restarting...**' }] }], { ephemeral: true }));
	}
};
