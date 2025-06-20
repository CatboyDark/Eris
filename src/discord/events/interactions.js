import { Events } from 'discord.js';
import { createMsg } from '../../utils/utils.js';

export default {
	name: Events.InteractionCreate,

	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			try {
				const command = interaction.client.slashCommands.get(interaction.commandName);
				await command.execute(interaction);
			}
			catch (e) {
				console.error('! Slash Command', e);

				if (interaction.replied || interaction.deferred) {
					return interaction.followUp({ embeds: [userError] });
				}
				return interaction.reply({ embeds: [userError] });
			}
		}
	}
};

const userError = createMsg([{ embed: [{ desc: '### Oops!\nThat wasn\'t supposed to happen! Staff has been notified.' }] }]);
