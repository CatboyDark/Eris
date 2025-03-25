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
	getUser,
	getPlayer,
	getDiscord,
	getGuild,
	getSBLevel,
	getCata,
	getNw,
	nFormat,
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

const config = readConfig();

function createMsg({ color, title, desc, fields, icon, image, footer, footerIcon }) {
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

async function getUser(user) { // Returns user.id, user.name
	try {
		const response = await fetch(`https://mowojang.matdoes.dev/${user}`);
		if (!response) {
			return null;
		}

		return await response.json();
	}
	catch (e) {
		console.error(e);
		if (e.response?.data === 'Not found') return null;
	}
}

async function getPlayer(user) {
	const player = await hypixel.getPlayer(user);
	return player;
}

async function getDiscord(player) {
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

		for (const profile of profiles.values()) {
			if (level < profile.level) {
				level = profile.level;
			}
		}
		return level;
	},

	current: async function (player) {
		const profiles = await hypixel.getSkyblockMember(player.uuid);
		if (!profiles) return 0;

		const profile = [...profiles.values()].find((profile) => profile.selected);
		return profile.level;
	}
};

const cataXP = JSON.parse(fs.readFileSync('./assets/cata.json', 'utf8'));
const floors = JSON.parse(fs.readFileSync('./assets/dungeon_floors.json', 'utf8'));

const getCata = {
	highest: async function (player, floor = null) {
		let cata;

		const profiles = await hypixel.getSkyblockProfiles(player.uuid);
		if (!profiles) return null;

		let thisCata = 0;
		for (const profile of profiles.values()) {
			if (profile.me.dungeons.experience.level > thisCata) {
				thisCata = profile.me.dungeons.experience.level;
				cata = profile.me.dungeons;
			}
		}

		return this.cataF(cata, floor);
	},

	current: async function (player, floor = null) {
		const profiles = await hypixel.getSkyblockProfiles(player.uuid);
		if (!profiles) return null;

		const profile = [...profiles.values()].find((profile) => profile.selected);
		const cata = profile.me.dungeons;

		return this.cataF(cata, floor);
	},

	getTheAccurateFuckingCataLevel(xp) {
		let requiredXP = 0;

		for (let i = 1; i <= 50; i++) {
			const levelXp = cataXP[i];
			if (xp < requiredXP + levelXp) {
				return Number((i - 1 + (xp - requiredXP) / levelXp).toFixed(2));
			}
			requiredXP += levelXp;
		}

		return Number((50 + (xp - requiredXP) / 200000000).toFixed(1));
	},

	getFloor(cata, floor) {
		const floorInfo = floors.find(f => f.id === floor);
		if (!floorInfo) return null;

		const { name, path } = floorInfo;
		const floorData = cata.floors[name];
		if (!floorData) return null;

		const getRuns = [
			floorData.fastestSPlusRun,
			floorData.fastestSRun,
			floorData.fastestRun
		].filter(Boolean);

		if (getRuns.length === 0) return null;

		function getScore(run) {
			return run.score_exploration + run.score_speed + run.score_skill + run.score_bonus;
		}

		const highestRun = getRuns.reduce((best, run) => {
			return getScore(run) > getScore(best) ? run : best;
		}, getRuns[0]);

		let rank;
		const score = getScore(highestRun);
		if (score >= 300) rank = 'S+';
		else if (score >= 269.5) rank = 'S';
		else if (score >= 230) rank = 'A';
		else if (score >= 160) rank = 'B';
		else if (score >= 100) rank = 'C';
		else rank = 'D';

		const totalSeconds = Math.floor(highestRun.elapsed_time / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		const time = `${minutes}:${seconds.toString().padStart(2, '0')}`;

		const runs = floor.startsWith('m')
			? cata.completions.masterCatacombs?.[path]
			: cata.completions.catacombs?.[path];

		const normalRuns = cata.completions.catacombs?.[path] ?? 0;
		const masterRuns = cata.completions.masterCatacombs?.[path] ?? 0;
		const collection = normalRuns + (masterRuns * 2);

		return {
			score: rank,
			time,
			runs,
			collection
		};
	},

	cataF(cata, floor) {
		const data = {
			level: this.getTheAccurateFuckingCataLevel(cata.experience.xp),
			healer: cata.classes.healer.level,
			mage: cata.classes.mage.level,
			berserk: cata.classes.berserk.level,
			archer: cata.classes.archer.level,
			tank: cata.classes.tank.level,
			classAvg: (cata.classes.healer.level + cata.classes.mage.level + cata.classes.berserk.level + cata.classes.archer.level + cata.classes.tank.level) / 5,
			secrets: cata.secrets.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
			spr: Number((cata.secrets / (cata.completions.catacombs.total + cata.completions.masterCatacombs.total)).toFixed(2))
		};

		if (floor) {
			const run = this.getFloor(cata, floor);

			return {
				...data,
				score: run.score,
				time: run.time,
				runs: run.runs,
				collection: run.collection
			};
		}

		return data;
	}
};

const getNw = {
	highest: async function (player) {
		let nw;

		const profiles = await hypixel.getSkyblockMember(player.uuid);
		if (!profiles) return null;

		let thisNw = 0;
		for (const profile of profiles.values()) {
			const networth = await profile.getNetworth();
			if (networth.networth > thisNw) {
				thisNw = networth.networth;
				nw = networth;
			}
		}

		return {
			networth: nFormat(nw.networth),
			purse: nFormat(nw.purse),
			bank: nFormat(nw.bank)
		};
	},

	current: async function (player) {
		const profiles = await hypixel.getSkyblockMember(player.uuid);
		if (!profiles) return null;

		const profile = [...profiles.values()].find((profile) => profile.selected);
		const nw = await profile.getNetworth();

		return {
			networth: nFormat(nw.networth),
			purse: nFormat(nw.purse),
			bank: nFormat(nw.bank)
		};
	}
};

function nFormat(value) {
	if (value >= 1e12) return (Math.floor(value / 1e10) / 100).toFixed(2) + 'T';
	if (value >= 1e9) return (Math.floor(value / 1e8) / 10).toFixed(1) + 'B';
	if (value >= 1e6) return Math.floor(value / 1e6) + 'M';
	if (value >= 1e3) return Math.floor(value / 1e3) + 'k';
	return Math.floor(value.toString());
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

const colors = JSON.parse(fs.readFileSync('./assets/colors.json', 'utf8'));

async function createImage(text) {
	const canvasWidth = 1100;
	const fontSize = config.bridge.font.size;
	const fontName = config.bridge.font.name;
	const lineHeight = 40;

	const blank = Canvas.createCanvas(1, 1);
	const blankCTX = blank.getContext('2d');
	blankCTX.font = `${fontSize}px ${fontName}`;

	const colorMap = {};
	colors.forEach(color => {
		colorMap[color.code] = color;
	});

	const parts = [];
	let index = 0;
	while (index < text.length) {
		if (text[index] === '§' && index + 1 < text.length) {
			const code = `§${text[index + 1]}`;
			index += 2;
			let message = '';
			while (index < text.length && text[index] !== '§') {
				message += text[index];
				index++;
			}
			parts.push({ code, message });
		}
		else {
			let message = '';
			while (index < text.length && text[index] !== '§') {
				message += text[index];
				index++;
			}
			if (message.length > 0) {
				parts.push({ code: '§f', message });
			}
		}
	}

	const lines = [];
	let currentLine = [];
	let currentLineWidth = 0;

	for (const part of parts) {
		const { code, message } = part;
		const words = message.split(' ');

		for (let i = 0; i < words.length; i++) {
			const word = words[i];
			const wordWidth = blankCTX.measureText(word).width;
			const spaceWidth = i > 0 ? blankCTX.measureText(' ').width : 0;

			if (currentLineWidth + wordWidth + spaceWidth > canvasWidth - 20) {
				lines.push(currentLine);
				currentLine = [];
				currentLineWidth = 0;
				currentLine.push({ code, text: word });
				currentLineWidth = wordWidth;
			}
			else {
				const textToAdd = currentLineWidth > 0 && i > 0 ? ` ${word}` : word;
				currentLine.push({ code, text: textToAdd });
				currentLineWidth += wordWidth + spaceWidth;
			}
		}
	}

	if (currentLine.length > 0) {
		lines.push(currentLine);
	}

	const canvasHeight = lines.length * lineHeight;
	const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	ctx.font = `${fontSize}px ${fontName}`;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		let xOffset = 20;
		const textYPosition = (i * lineHeight) + 28;

		for (const part of line) {
			const colorData = colorMap[part.code] || colorMap['§f'];

			ctx.fillStyle = colorData.shadow;
			ctx.fillText(part.text, xOffset + 4, textYPosition + 4);

			ctx.fillStyle = colorData.hex;
			ctx.fillText(part.text, xOffset, textYPosition);

			xOffset += ctx.measureText(part.text).width;
		}
	}

	const buffer = canvas.toBuffer('image/png');
	return new AttachmentBuilder(buffer, { name: 'image.png' });
}
