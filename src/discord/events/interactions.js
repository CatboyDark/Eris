import { Events, Team } from 'discord.js';
import { display, createMsg, readConfig } from '../../utils/utils.js';

export default {
	name: Events.InteractionCreate,

	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			try {
				const command = interaction.client.slashCommands.get(interaction.commandName);
				await command.execute(interaction);
			}
			catch (e) {
				display.r(`Slash Command > ${e}`);
				await error(interaction, e);
			}
		}
		if (interaction.isButton()) {
			const ignoredButtons = ['quizJoin', 'toggle', 'quizLength', 'quizJoin', 'quizStart', 'questionNext', 'region'];
			for (const button of ignoredButtons) {
				if (interaction.customId.startsWith(button)) return;
			}

			try {
				const button = interaction.client.buttons.get(interaction.customId);
				await button.execute(interaction);
			}
			catch (e) {
				display.r(`Button > ${e}`);
				await error(interaction, e);
			}
		}
	}
};

async function error(interaction, e) {
	const config = readConfig();
	const logs = interaction.client.channels.cache.get(config.logs.bot);
	const app = await interaction.client.application.fetch();

	await logs.send({
		content: `<@${app.owner instanceof Team ? app.owner.ownerId : app.owner.id}>`,
		embeds: [createMsg({
			color: 'Red',
			title: 'A Silly Has Occured!',
			desc: `\`\`\`${e.message}\`\`\`\n-# If you believe this is a bug, please contact @CatboyDark.`
		})]
	});

	const userError = createMsg({ embeds: [createMsg({
		color: 'Red',
		title: 'Oops!',
		desc: 'That wasn\'t supposed to happen. Staff has been notified.'
	})] });

	if (interaction.replied || interaction.deferred) {
		return interaction.followUp({ embeds: [userError] });
	}
	return interaction.reply({ embeds: [userError] });
}
