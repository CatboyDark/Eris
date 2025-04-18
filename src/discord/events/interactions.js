import { Events, Team } from 'discord.js';
import { createMsg, discordLog, display, getChannel, readConfig } from '../../utils/utils.js';

const config = readConfig();

export default {
	name: Events.InteractionCreate,

	async execute(interaction) {
		if (config.logs.bot.enabled) {
			await discordLog(interaction);
		}

		if (interaction.isChatInputCommand()) {
			try {
				const command = interaction.client.slashCommands.get(interaction.commandName);
				await command.execute(interaction);
			}
			catch (e) {
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
				await error(interaction, e);
			}
		}
	}
};

async function error(interaction, e) {
	display.r(interaction.isChatInputCommand() ? 'Slash Command >' :
		interaction.isButton() ? 'Button >' :
		interaction.isStringSelectMenu() ? 'Select Menu >' :
		interaction.isModalSubmit() ? 'Form >' : 'Unknown Interaction >',
	e);

	const logs = await getChannel(config.logs.bot.channel);
	const app = await interaction.client.application.fetch();

	await logs.send({
		content: `<@${app.owner instanceof Team ? app.owner.ownerId : app.owner.id}>`,
		embeds: [createMsg({
			color: 'Red',
			title: 'A Silly Has Occured!',
			desc: `\`\`\`${e.message}\`\`\`\n-# If you believe this is a bug, please contact @catboydark.`,
			timestamp: true
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
