import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, PermissionFlagsBits, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import fs from 'fs';
import hypixel from './api/hypixel.js';
import { discord } from './discord/Discord.js';
import display from './display.js';
import Canvas from 'canvas';

export {
	readConfig,
	writeConfig,
	createMsg,
	createRow,
	createForm,
	createSlash,
	getEmoji,
	getPerms,
	getIGN,
	getPlayer,
	getDiscord,
	getGuild,
	getSBLevel,
	getCata,
	getTheAccurateFuckingCataLevel,
	updateRoles,
	getMsg,
	createImage
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
	const app = await discord.application.emojis.fetch();
	const emoji = app.find(e => e.name === name);
	if (!emoji) display.r(`Invalid emoji: ${name}`);

 	return emoji;
}

const permissions = new Set([
	'Owner',
	'Admin',
	'SetLinkChannel',
	'SetMapChannel',
	'SetEventsChannel',
	'SetStatsChannels',
	'DeleteMessages',
	'RestartBot',
	'LinkOverride',
	'MuteMembers',
	'BanMembers'
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
		const response = await fetch(`https://mowojang.matdoes.dev/${uuid}`);
		const data = await response.json();
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

const getGuild = {
	name: async function (value) {
		return await hypixel.getGuild('name', value);
	},

	player: async function (value) {
		return await hypixel.getGuild('player', value);
	}
};

const getSBLevel = {
	highest: async function (player) {
		let level = 0;

		const profiles = await hypixel.getSkyblockMember(player.uuid);
		if (!profiles) return 0;
		// eslint-disable-next-line no-unused-vars
		for (const [profileName, profileData] of profiles.entries()) {
			if (level < profileData.level) {
				level = profileData.level;
			}
		}
		return level;
	},

	current: async function (player) {
		const profiles = await hypixel.getSkyblockMember(player.uuid);
		if (!profiles) return 0;

		const profile = [...profiles.values()].find((profile) => profile.selected);
		return profile?.level || 0;
	}
};

const getCata = {
	highest: async function (player) {
		let highestProfile = null;
		let cata = 0;

		const profiles = await hypixel.getSkyblockProfiles(player.uuid);
		if (!profiles) return null;

		profiles.forEach((profile) => {
			const currentCata = profile.me?.dungeons.experience.level || 0;
			if (currentCata > cata) {
				cata = currentCata;
				highestProfile = profile.me.dungeons;
			}
		});
		return highestProfile;
	},

	current: async function (player) {
		const profiles = await hypixel.getSkyblockProfiles(player.uuid);
		if (!profiles) return null;

		const selectedProfile = profiles.find(profile => profile.selected);
		return selectedProfile.me.dungeons;
	}
};

function getTheAccurateFuckingCataLevel(level, xp) {
	if (level > 50) {
		xp -= 569809640;
	}

	const extraLevels = xp / 200000000;
	if (level <= 50) {
		return Number(level.toFixed(2));
	}

	const accurateLevel = 50 + extraLevels;
	return Number(accurateLevel.toFixed(2));
}

async function updateRoles(member, player) {
	const config = readConfig();
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

function getMsg(message) {
	const parts = message.split(' ');

	let channel;
	switch (true) {
		case message.startsWith('Guild >'):
			channel = 'guild';
			break;
		case message.startsWith('Officer >'):
			channel = 'officer';
			break;
		case message.startsWith('Party >'):
			channel = 'party';
			break;
		case message.startsWith('From'):
			channel = 'dm';
			break;
		default:
			return;
	}

	let index = 0;
	index = channel === 'dm' ? 1 : 2;

	const rank = parts[index] && parts[index].startsWith('[') && parts[index].endsWith(']')
		? parts[index].slice(1, -1)
		: null;
	index++;

	const sender = parts[index] && parts[index].endsWith(':')
		? parts[index].slice(0, -1)
		: parts[index];
	index++;

	const guildRank = channel === 'guild' && parts[index] && parts[index].startsWith('[')
		? parts[index].substring(1, parts[index].indexOf(']'))
		: null;

	const content = message.slice(message.indexOf(':') + 1).trim() ?? null;

	return { channel, rank, sender, guildRank, content };
}

async function createImage(text) {
	const fg = 'black';
	const size = 40;
	const padding = 1;

	Canvas.deregisterAllFonts();
	Canvas.registerFont('./assets/MinecraftRegular-Bmg3.ttf', {
		family: 'Minecraft'
	});

	const blank = Canvas.createCanvas(1, 1);
	const blankCTX = blank.getContext('2d');
	blankCTX.font = `${size}px Minecraft`;

	const metrics = blankCTX.measureText(text);
	const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

	const canvasWidth = Math.ceil(metrics.width + padding * 2);
	const canvasHeight = Math.ceil(textHeight + padding * 2);

	const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext('2d');

	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	ctx.font = `${size}px Minecraft`;
	ctx.fillStyle = fg;
	ctx.textBaseline = 'top';

	const textY = padding + (canvasHeight - textHeight - padding * 2) / 2;
	ctx.fillText(text, padding, textY);

	const buffer = canvas.toBuffer('image/png');

	return new AttachmentBuilder(buffer, { name: 'image.png' });
}
