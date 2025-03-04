import { MessageFlags } from 'discord.js';
import { createMsg, readConfig } from '../../../helper.js';
import { getMongo, membersSchema } from '../../../mongo/schemas.js';

export default {
	name: 'unlink',
	desc: 'Unlink your account',

	async execute(interaction) {
		const members = getMongo('Eris', 'members', membersSchema);
		const result = await members.findOneAndDelete({ dcid: interaction.user.id });

		if (result) {
			await interaction.reply({ embeds: [createMsg({ desc: '**You are now unlinked!**' })], flags: MessageFlags.Ephemeral });

			const config = readConfig();
			if (config.link.role.enabled) {
				if (interaction.member.roles.cache.has(config.link.role.role)) {
					interaction.member.roles.remove(config.link.role.role);
				}
			}
		}
		else {
			await interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**You are not linked!**' })], flags: MessageFlags.Ephemeral });
		}
	}
};
