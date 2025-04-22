import { Events } from 'discord.js';
import { createMsg, Error, getChannel, readConfig } from '../../utils/utils.js';

const config = readConfig();

const userError = createMsg({ embeds: [createMsg({
	color: 'Red',
	title: 'Oops!',
	desc: 'That wasn\'t supposed to happen. Staff has been notified.'
})] });

export default {
	name: Events.InteractionCreate,

	async execute(interaction) {
		let log = null;
		if (config.logs.bot.enabled) {
			log = await interactionLog(interaction);
		}

		if (interaction.isChatInputCommand()) {
			try {
				const command = interaction.client.slashCommands.get(interaction.commandName);
				await command.execute(interaction);

				if (config.logs.bot.enabled) {
					await interactionLog(interaction, log);
				}
			}
			catch (e) {
				await Error('! Slash Command !', e);

				if (interaction.replied || interaction.deferred) {
					return interaction.followUp({ embeds: [userError] });
				}
				return interaction.reply({ embeds: [userError] });
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
				await Error('! Button !', e);

				if (interaction.replied || interaction.deferred) {
					return interaction.followUp({ embeds: [userError] });
				}
				return interaction.reply({ embeds: [userError] });
			}
		}
	}
};

async function interactionLog(interaction, log = null) {
	const discordLogs = getChannel(config.logs.bot.channel);

	let desc;

	if (interaction.isChatInputCommand() && config.logs.bot.commands) {
		const options = interaction.options.data.map((option) =>
			option.type === 6 ? ` <@${option.value}> ` :
			option.type === 8 ? ` <@&${option.value}> ` :
			` ${option.value} `
		);
		const optionsString = options.length > 0 ? `**[**${options.join('**,** ')}**]**` : '';

		let url = `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}`;
		if (log) {
			const message = await interaction.fetchReply();
			url = message.url;
		}

		desc = `<@${interaction.user.id}> ran: **/${interaction.commandName}** ${optionsString}\n\n${url}`;
	}
	else if (interaction.isButton() && config.logs.bot.buttons) {
		desc = `<@${interaction.user.id}> clicked: **${interaction.component.label}**\n\n${interaction.message.url}`;
	}
	else if (interaction.isStringSelectMenu() && config.logs.bot.selectMenus) {
		const labels = interaction.values.map((value) => {
			const option = interaction.component.options.find(
				(option) => option.value === value
			);
			return option ? option.label : value;
		});
		desc = `<@${interaction.user.id}> selected **${labels.join(', ')}** from **${interaction.component.placeholder}**\n\n${interaction.message.url}`;
	}
	else if (interaction.isModalSubmit() && config.logs.bot.forms) {
		desc = `<@${interaction.user.id}> submitted **${interaction.customId}**\n\n${interaction.message.url}`;
	}
	else {
		desc = 'Unknown Interaction!';
	}

	if (log) {
		return log.edit({ embeds: [createMsg({ desc, timestamp: true })] });
	}
	else {
		return discordLogs.send({ embeds: [createMsg({ desc, timestamp: true })] });
	}
}
