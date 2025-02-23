import { execSync } from 'child_process';
import display from '../../../display.js';
import { createMsg } from '../../../helper.js';

async function restart(client) {
	try {
		const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

		execSync(`git pull origin ${branch}`);
		await client.destroy();
		execSync('node start.js');
	}
	catch (error) {
		display.r(`Restart > ${error}`);
		throw error;
	}
}

export default
{
	name: 'restart',
	desc: 'Restarts and updates the bot',
	perms: 'Admin',

	async execute(interaction) {
		await interaction.deferReply();
		await restart(interaction.client);
		await interaction.followUp({ embeds: [createMsg({ desc: `**Successfully restarted ${interaction.client.user.username}!**` })] });
	}
};

export { restart };

