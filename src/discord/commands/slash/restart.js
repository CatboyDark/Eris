import { execSync } from 'child_process';
import { createMsg, display, getPerms } from '../../../utils/utils.js';
import { MessageFlags } from 'discord.js';

export default {
	name: 'restart',
	desc: 'Restarts and updates the bot',

	async execute(interaction) {
		const perms = getPerms(interaction.member);
		if (!perms.includes('RestartBot')) return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**You don\'t have permission to use this command!**' })] });

		// await interaction.deferReply();
		await interaction.reply({ embeds: [createMsg({ desc: '**Restarting...**' })], flags: MessageFlags.Ephemeral });
		await restart();
		// await interaction.followUp({ embeds: [createMsg({ desc: `**Successfully restarted ${interaction.client.user.displayName}!**` })] });
	}
};

async function restart() {
	display.y('Restarting...');

	try {
		const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

		execSync(`git pull origin ${branch}`);
		// await discord.destroy();
		// await minecraft.end();
		// start();
		execSync('pm2 restart Eris');
	}
	catch (e) {
		display.r(`Restart > ${e}`);
		throw e;
	}
}

export { restart };
