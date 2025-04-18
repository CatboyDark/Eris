import { Events, Team } from 'discord.js';
import { createMsg, display, getChannel, readConfig } from '../../utils/utils.js';

const config = readConfig();

export default {
	name: Events.InteractionCreate,

	async execute(interaction) {
		let log = null;
		if (config.logs.bot.enabled) {
			log = await discordLog(interaction);
		}

		if (interaction.isChatInputCommand()) {
			try {
				const command = interaction.client.slashCommands.get(interaction.commandName);
				await command.execute(interaction);

				if (config.logs.bot.enabled) {
					await discordLog(interaction, log);
				}
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

async function discordLog(interaction, log = null) {
	const discordLogs = await getChannel(config.logs.bot.channel);

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
			const messageID = await interaction.fetchReply().then(reply => reply.id);
			url += `/${messageID}`;
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

	return await discordLogs.send({ embeds: [createMsg({ desc, timestamp: true })] });
}


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
