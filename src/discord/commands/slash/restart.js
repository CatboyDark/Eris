import { execSync } from 'child_process';
import { start } from '../../../../start.js';
import display from '../../../display.js';
import { createMsg, getPerms } from '../../../helper.js';
import { client } from '../../Discord.js';

export default {
	name: 'restart',
	desc: 'Restarts and updates the bot',

	async execute(interaction) {
		const perms = getPerms(interaction.member);
		if (!perms.includes('RestartBot')) return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**You don\'t have permission to use this command!**' })] });

		await interaction.deferReply();
		await restart();
		await interaction.followUp({ embeds: [createMsg({ desc: `**Successfully restarted ${interaction.client.user.username}!**` })] });
	}
};

async function restart() {
	display.y('Restarting...');

	try {
		const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

		execSync(`git pull origin ${branch}`);
		await client.destroy();
		start();
	}
	catch (e) {
		display.r(`Restart > ${e}`);
		throw e;
	}
}

export { restart };
