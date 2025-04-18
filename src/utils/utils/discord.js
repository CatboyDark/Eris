import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, PermissionFlagsBits, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { discord } from '../../discord/Discord.js';
import { display, getGuild, getSBLevel, readConfig } from '../utils.js';

export {
	createForm,
	createMsg,
	createRow,
	createSlash,
	getChannel,
	getEmoji,
	updateRoles
};

const config = readConfig();

function createMsg({ color, title, desc, fields, icon, image, footer, footerIcon, timestamp }) {
	const embed = new EmbedBuilder();

	embed.setColor(color ?? config.color);
	if (title) embed.setTitle(title);
	if (desc) embed.setDescription(desc);
	if (icon) embed.setThumbnail(icon);
	if (image) embed.setImage(image);
	if (footer) embed.setFooter({ text: footer, iconURL: footerIcon });
	if (fields) {
		fields.forEach(field => {
			embed.addFields({
				name: field.title,
				value: field.desc,
				inline: field.inline || false
			});
		}
		);
	}
	if (timestamp) embed.setTimestamp();
	return embed;
};

const styles = {
	Blue: ButtonStyle.Primary,
	Gray: ButtonStyle.Secondary,
	Green: ButtonStyle.Success,
	Red: ButtonStyle.Danger
};

function createButtons({ id, label, color, url, emoji }) {
	if (typeof color === 'boolean') color = color ? 'Green' : 'Red';

	const button = new ButtonBuilder();

	if (url) {
		button.setURL(url).setStyle(ButtonStyle.Link);
	}
	else {
		if (label) button.setLabel(label);
		if (emoji) button.setEmoji(emoji);

		button.setCustomId(id).setStyle(styles[color]);
	}
	return button;
}

function createSelectMenu({ id, placeholder, options }) {
	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId(id)
		.setPlaceholder(placeholder);

	const selectMenuOptions = options.map(({ value, label, desc }) =>
		new StringSelectMenuOptionBuilder()
			.setValue(value)
			.setLabel(label)
			.setDescription(desc)
	);
	return selectMenu.addOptions(selectMenuOptions);
}

function createRow(components) {
	const actionRow = new ActionRowBuilder();

	components.forEach((item) => {
		if (item.label || item.emoji) {
			actionRow.addComponents(createButtons(item));
		}
		else if (item.placeholder && item.options) {
			actionRow.addComponents(createSelectMenu(item));
		}
	});
	return actionRow;
}

function createForm({ id, title, components }) {
	const modal = new ModalBuilder().setCustomId(id).setTitle(title);

	components.forEach((component) => {
		let textInputStyle;

		switch (component.style.toLowerCase()) {
			case 'short':
				textInputStyle = TextInputStyle.Short;
				break;
			case 'long':
				textInputStyle = TextInputStyle.Paragraph;
				break;
			default:
				throw new Error(`Invalid text input style: ${component.style}`);
		}

		const textInput = new TextInputBuilder()
			.setCustomId(component.id)
			.setLabel(component.label)
			.setStyle(textInputStyle)
			.setRequired(component.required);

		if (Array.isArray(component.length) && component.length.length === 2) {
			const [minLength, maxLength] = component.length.map((num) =>
				parseInt(num, 10)
			);
			if (isNaN(minLength) || isNaN(maxLength)) {
				throw new Error(`Invalid length values: ${component.length}`);
			}
			textInput.setMinLength(minLength).setMaxLength(maxLength);
		}

		modal.addComponents(new ActionRowBuilder().addComponents(textInput));
	});
	return modal;
}

function createSlash({ name, desc, options = [], permissions = [], execute }) {
	const command = new SlashCommandBuilder()
		.setName(name)
		.setDescription(desc);

	options.forEach((option) => {
		const { type, name, desc, required, choices } = option;
		const isRequired = required === undefined ? false : required;
		const hasChoices = choices || [];

		switch (type) {
			case 'user':
				command.addUserOption((o) => o.setName(name).setDescription(desc).setRequired(isRequired));
				break;
			case 'role':
				command.addRoleOption((o) => o.setName(name).setDescription(desc).setRequired(isRequired));
				break;
			case 'channel':
				command.addChannelOption((o) => o.setName(name).setDescription(desc).setRequired(isRequired));
				break;
			case 'string':
				command.addStringOption((o) => {
					o.setName(name).setDescription(desc).setRequired(isRequired);
					if (hasChoices.length > 0) o.addChoices(...hasChoices);
					return o;
				});
				break;
			case 'integer':
				command.addIntegerOption((o) => {
					o.setName(name).setDescription(desc).setRequired(isRequired);
					if (hasChoices.length > 0) o.addChoices(...hasChoices);
					return o;
				});
				break;
			default:
				throw new Error(`Invalid option: ${type}`);
		}
	});

	if (permissions && permissions.length > 0) {
		const permissionBits = permissions.reduce((acc, perm) => {
			const permBit = PermissionFlagsBits[perm];
			if (permBit === undefined) {
				throw new Error(`Invalid permission: ${perm}`);
			}
			return acc | BigInt(permBit);
		}, BigInt(0));

		command.setDefaultMemberPermissions(permissionBits);
	}

	return {
		data: command,
		execute
	};
}

async function getEmoji(name) {
	const app = await discord.application.emojis.fetch();
	const emoji = app.find(e => e.name === name);
	if (!emoji) display.r(`Invalid emoji: ${name}`);

	return emoji;
}

async function getChannel(channel) {
	return discord.channels.cache.get(channel);
}

async function updateRoles(member, player) {
	const guild = await getGuild.player(player.uuid);

	const addedRoles = [];
	const removedRoles = [];

	if (config.link.role.enabled) {
		if (!member.roles.cache.has(config.link.role.role)) {
			await member.roles.add(config.link.role.role);
			addedRoles.push(config.link.role.role);
		}
	}

	if (config.welcome.role.removeOnLink) {
		if (member.roles.cache.has(config.welcome.role.role)) {
			await member.roles.remove(config.welcome.role.role);
			removedRoles.push(config.welcome.role.role);
		}
	}

	if (config.guild.role.enabled) {
		if (guild && guild.name === config.guild.name) {
			if (!member.roles.cache.has(config.guild.role.role)) {
				await member.roles.add(config.guild.role.role);
				addedRoles.push(config.guild.role.role);
			}
		}
		else {
			if (member.roles.cache.has(config.guild.role.role)) {
				await member.roles.remove(config.guild.role.role);
				removedRoles.push(config.guild.role.role);
			}
		}
	}

	// guildRankRoles

	if (config.levelRoles.enabled) {
		const level = await getSBLevel.highest(player);
		const key = Math.floor(level / 40) * 40;
		const assignedRole = config.levelRoles.roles[key];

		if (!assignedRole) return;

		if (!member.roles.cache.has(assignedRole)) {
			await member.roles.add(assignedRole);
			addedRoles.push(assignedRole);
		}

		for (const role of Object.values(config.levelRoles.roles)) {
			if (role !== assignedRole && member.roles.cache.has(role)) {
				await member.roles.remove(role);
				removedRoles.push(role);
			}
		}
	}

	return { addedRoles, removedRoles };
}
