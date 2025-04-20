import { MessageFlags } from 'discord.js';
import { createMsg, getPerms } from '../../../utils/utils.js';
import { discord } from '../../Discord.js';

export default
{
	name: 'kill',
	desc: 'Kill the bot',

	async execute(interaction) {
		const perms = getPerms(interaction.member);
		if (!perms.includes('KillBot')) return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**You don\'t have permission to use this command!**' })] });

		await interaction.reply({ embeds: [createMsg({ desc: `**Killing ${discord.user.displayName}...**` })], flags: MessageFlags.Ephemeral });
		process.exit(0);
	}
};
