import axios from 'axios';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, PermissionFlagsBits, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import fs from 'fs';
import hypixel from './api/hypixel.js';
import { client } from './discord/Discord.js';
import display from './display.js';

export {
	readConfig,
	writeConfig,
	createMsg,
	createRow,
	createForm,
	createSlash,
	getEmoji,
	getPerms,
	getGuild,
	getIGN,
	getPlayer,
	getDiscord,
	updateRoles
};

function readConfig() {
	return JSON.parse(fs.readFileSync('./config.json', 'utf8'));
}

function writeConfig(config) {
	fs.writeFileSync('./config.json', JSON.stringify(config, null, '\t'), 'utf8');
}

function createMsg({ color, title, desc, fields, icon, image, footer, footerIcon }) {
	const config = readConfig();
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
		});
	}
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
	const app = await client.application.emojis.fetch();
	const emoji = app.find(e => e.name === name);
	if (!emoji) display.r(`Invalid emoji: ${name}`);

 	return emoji;
}

const permissions = new Set([
	'Owner',
	'Admin',
	'setLinkChannel',
	'DeleteMessages',
	'RestartBot',
	'LinkOverride'
]);

function getPerms(member) {
	const config = readConfig();
	const roles = member.roles.cache.map(role => role.id);
	const perms = new Set();

	config.permissions.forEach(p => {
		if (roles.includes(p.role)) {
			if (p.perms.includes('Owner')) {
				permissions.forEach(perm => perms.add(perm));
			}
			else if (p.perms.includes('Admin')) {
				permissions.forEach(perm => {
					if (perm !== 'Owner') perms.add(perm);
				});
			}
			else {
				p.perms.forEach(perm => perms.add(perm));
			}
		}
	});
	return [...perms];
}

async function getIGN(uuid) {
	try {
		const { data } = await axios.get(`https://mowojang.matdoes.dev/${uuid}`);
		return data.name;
	}
	catch (e) {
		console.error(e);
		if (e.response?.data === 'Not found') return 'Invalid UUID.';
	}
}

async function getPlayer(user) {
	const player = await hypixel.getPlayer(user);
	return player;
}

async function getDiscord(ign) {
	const player = await hypixel.getPlayer(ign);
	const discord = player.socialMedia.find((media) => media.id === 'DISCORD');
	return discord ? discord.link.toLowerCase() : null;
}

async function getGuild(type, value) {
	let guild;

	if (type === 'player') {
		guild = await hypixel.getGuild('player', value);
	}
	else if (type === 'guild') {
		guild = await hypixel.getGuild('name', value);
	}
	return guild;
}

async function updateRoles(member, player) {
	const config = readConfig();
	const guild = await getGuild('player', player.uuid);

	const addedRoles = [];
	const removedRoles = [];

	if (config.link.roleToggle) {
		if (!member.roles.cache.has(config.link.role)) {
			await member.roles.add(config.link.role);
			addedRoles.push(config.link.role);
		}
	}

	if (config.guild.roleToggle) {
		if (guild && guild.name === config.guild.name) {
			if (!member.roles.cache.has(config.guild.role)) {
				await member.roles.add(config.guild.role);
				addedRoles.push(config.guild.role);
			}
		}
		else {
			if (member.roles.cache.has(config.guild.role)) {
				await member.roles.remove(config.guild.role);
				removedRoles.push(config.guild.role);
			}
		}
	}
	return { addedRoles, removedRoles };
}
