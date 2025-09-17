import { Events } from 'discord.js';
import { Config, createMsg, DCsend, getRole, read, userError } from '../../utils/utils.js';

export default {
	name: Events.InteractionCreate,

	async execute(interaction) {
		let log = null;
		if (Config.logs.bot.commands || Config.logs.bot.buttons || Config.logs.bot.menus/* || config.logs.bot.forms*/) {
			log = await interactionLog(interaction);
		}

		try {
			if (interaction.isChatInputCommand()) {
				const command = interaction.client.slashCommands.get(interaction.commandName);
				await command.execute(interaction);

				if (Config.logs.bot.commands) {
					await interactionLog(interaction, log);
				}
			}
			else if (interaction.isButton()) {
				if (interaction.customId.startsWith('rps')) return;

				const isReactionRole = await reactionRoles(interaction);
				if (isReactionRole) return;

				const button = interaction.client.buttons.get(interaction.customId);
				await button.execute(interaction);
			}
			else if (interaction.isStringSelectMenu()) {
				const menu = interaction.client.menus.get(interaction.customId);
				await menu.execute(interaction);
			}
		}
		catch (e) {
			const type =
				interaction.isChatInputCommand() ? 'Slash Command' :
				interaction.isButton() ? 'Button' :
				interaction.isStringSelectMenu() ? 'Menu' :
				'Unknown Interaction';

			let error = e;
			if (e.message.includes('Cannot read properties of undefined (reading \'execute\')')) {
				error = `Invalid ${type}: ${interaction.customId}`;
			}

			console.error(`Error | ${type}`, error);

			if (interaction.replied || interaction.deferred) {
				return interaction.followUp(userError);
			}
			return interaction.reply(userError);
		}
	}
};

async function interactionLog(interaction, log = null) {
	let desc;

	if (interaction.isChatInputCommand() && Config.logs.bot.commands) {
		const options = interaction.options.data.map((option) =>
			option.type === 6 ? `<@${option.value}>` :
			option.type === 7 ? `<#${option.value}>` :
			option.type === 8 ? `<@&${option.value}>` :
			`${option.value}`
		);
		const optionString = options.length > 0 ? ' ' + options.join(' ') : '';

		let url = `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}`;
		if (log) {
			const message = await interaction.fetchReply();
			url = message.url;
		}

		desc = `<@${interaction.user.id}> ran **/${interaction.commandName}**${optionString}\n\n${url}`;
	}
	else if (interaction.isButton() && Config.logs.bot.buttons) {
		desc = `<@${interaction.user.id}> clicked **${interaction.component.data.label}**\n\n${interaction.message.url}`;
	}

	if (!desc) return;
	if (log) {
		return log.edit(createMsg([{ embed: [{ desc }], timestamp: 'f' }], { mentions: false }));
	}
	else {
		return DCsend(Config.logs.bot.channelID, [{ embed: [{ desc }], timestamp: 'f' }], { mentions: false });
	}
}

async function reactionRoles(interaction) {
	const cache = read('.cache/bot/reactionroles.json');
	const isReactionRole = cache[interaction.customId];

	if (!isReactionRole) return false;

	const role = getRole(isReactionRole);

	if (interaction.member.roles.cache.has(role.id)) {
		await interaction.member.roles.remove(role.id);
		await interaction.reply(createMsg(
			[{ embed: [{ desc: `**${role} has been removed!**` }] }],
			{ ephemeral: true })
		);
	}
	else {
		await interaction.member.roles.add(role.id);
		await interaction.reply(createMsg(
			[{ embed: [{ desc: `**${role} has been assigned!**` }] }],
			{ ephemeral: true })
		);
	}

	return true;
}
