import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ContainerBuilder, EmbedBuilder, FileBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, PermissionFlagsBits, resolveColor, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextDisplayBuilder, ThumbnailBuilder } from 'discord.js';
import { discord } from '../../discord/Discord.js';
import { DCserver } from '../../discord/_events/clientReady.js';
import path from 'path';
import { Config, LinkedUsers } from './read.js';
import { getGuild, getSkyblock } from './hypixel.js';

export {
	createSlash,
	getChannel,
	getRole,
	getMember,
	getEmoji,
	createMsg,
	createMessage,
	DCsend,
	updateRoles
};

function createSlash({ name, desc, options = [], permissions = [], execute }) {
	const command = new SlashCommandBuilder().setName(name).setDescription(desc);

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

	if (typeof permissions === 'number' && permissions === 0) {
		command.setDefaultMemberPermissions(BigInt(0));
	}
	else if (Array.isArray(permissions) && permissions.length > 0) {
		const permissionBits = permissions.reduce((acc, perm) => {
			const permBit = PermissionFlagsBits[perm];
			if (!permBit) {
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

function getChannel(channel) {
	return discord.channels.cache.get(channel);
}

function getRole(role) {
	return DCserver.roles.cache.get(role);
}

function getMember(member) {
	return DCserver.members.cache.get(member);
}

async function getEmoji(name) {
	const app = await discord.application.emojis.fetch();
	const emoji = app.find(e => e.name === name);
	if (!emoji) return console.red(`Invalid Emoji: ${name}`);

	return emoji;
}

const colors = {
	Error: 'FF4040',
	Success: '40FF40'
};

/*
	const exampleMessage = createMsg([

		// CONTAINERS MAY INCLUDE ANY OTHER COMPONENT
		{
			spoiler: true,
			color: 'FFFFFF',
			embed: [
				{
					desc: 'This is a standalone line of text.'
				}
			]
		},

		{ desc: 'This is a standalone line of text.' },
		{
			desc: ['Multiple text entries', 'With an icon and a button!'],
			icon: {
				url: 'https://example.com/icon.png',
				desc: 'Example icon',
				spoiler: false
			},
			button: {
				label: 'Click Me',
				emoji: { name: '🍆' },
				color: 'Blue',
				id: 'click_me',
			}
		},
		[
			// MAX 10 IMAGES PER GALLERY
			{ img: 'https://example.com/image.jpg', desc: 'Image 1', spoiler: true }
		],
		{ file: 'https://example.com/file.pdf' },
		{ divider: true, size: 'small' }, // FOR WHITESPACE divider: false
		[
			{ id: 'button_id', label: 'Do Not Click!', emoji: '❗', color: 'Red', disabled: false }, // COLOR SUPPORTS BOOL true = 'Green' false = 'Red'
			{ label: 'Subscribe to Technoblade!', url: 'https://www.youtube.com/@Technoblade' }
		],
		{
			id: 'select_menu_id',
			label: 'Select an option',
			multi: [1, 10] // MIN, MAX
			disabled: false,
			options: [
				{
					id: 'option_1',
					label: 'Option 1',
					desc: 'This is option 1',
					emoji: '1️⃣',
					setDefault: false
				},
			]
		}
	]);
*/
function createMsg(items, { ephemeral = false, mentions = true } = {}) {
	const components = [];
	const files = [];

	for (const item of items) {
		if (item.embed) {
			const container = new ContainerBuilder();
			if (item.color) {
				if (item.color in colors) container.setAccentColor(resolveColor(colors[item.color]));
				else container.setAccentColor(resolveColor(item.color));
			}
			if (item.spoiler) container.setSpoiler(true);

			for (const embed of item.embed) {
				if (embed.desc || embed.icon || embed.button) {
					const lines = Array.isArray(embed.desc) ? embed.desc : [embed.desc];

					if (!embed.icon && !embed.button) {
						lines.forEach(line => {
							container.addTextDisplayComponents(new TextDisplayBuilder().setContent(line));
						});
					}
					else {
						const section = new SectionBuilder();
						lines.forEach(line => {
							section.addTextDisplayComponents(new TextDisplayBuilder().setContent(line));
						});

						if (embed.icon) {
							const icon = new ThumbnailBuilder().setURL(embed.icon.url);
							if (embed.icon.desc) icon.setDescription(embed.icon.desc);
							if (embed.icon.spoiler) icon.setSpoiler(true);
							section.setThumbnailAccessory(icon);
						}
						if (embed.button) {
							const button = createButtons(embed.button);
							section.addActionRowComponents(new ActionRowBuilder().addComponents(button));
						}

						container.addSectionComponents(section);
					}
				}
				else if (embed.options) {
					container.addActionRowComponents(new ActionRowBuilder().addComponents(createMenu(embed)));
				}
				else if (Array.isArray(embed)) {
					if (embed.every(x => x.img)) {
						const gallery = new MediaGalleryBuilder();

						embed.forEach(({ img, desc, spoiler }) => {
							const media = new MediaGalleryItemBuilder().setURL(img);
							if (desc) media.setDescription(desc);
							if (spoiler) media.setSpoiler(true);
							gallery.addItems(media);
						});

						container.addMediaGalleryComponents(gallery);
					}
					else {
						const row = new ActionRowBuilder();
						embed.forEach(button => row.addComponents(createButtons(button)));

						container.addActionRowComponents(row);
					}
				}
				else if (item.file) {
					if (/^https?:\/\//i.test(item.file)) {
						components.push(new FileBuilder().setURL(item.file));
					}
					else {
						const filename = require('path').basename(item.file);
						files.push(new AttachmentBuilder(item.file));
						components.push(new FileBuilder().setURL(`attachment://${filename}`));
					}
				}
				else if (embed.divider) {
					container.addSectionComponents(new SeparatorBuilder().setDivider(embed.divider).setSpacing(embed.size === 'small' ? SeparatorSpacingSize.Small : SeparatorSpacingSize.Large));
				}
			}
			if (item.timestamp) {
				let timestamp;
				if (item.timestamp === 'r') timestamp = `<t:${Math.floor(Date.now() / 1000)}:R>`;
				else if (item.timestamp === 'f') timestamp = `<t:${Math.floor(Date.now() / 1000)}:f>`;
				container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`_ _\n-# ${timestamp}`));
			}
			components.push(container);
		}
		else if (item.desc || item.icon || item.button) {
			const lines = Array.isArray(item.desc) ? item.desc : [item.desc];

			if (!item.icon && !item.button) {
				lines.forEach(line => {
					components.push(new TextDisplayBuilder().setContent(line));
				});
			}
			else {
				const section = new SectionBuilder();

				lines.forEach(line => {
					section.addTextDisplayComponents(new TextDisplayBuilder().setContent(line));
				});

				if (item.icon) {
					const icon = new ThumbnailBuilder().setURL(item.icon.url);
					if (item.icon.desc) icon.setDescription(item.icon.desc);
					if (item.icon.spoiler) icon.setSpoiler(true);
					section.setThumbnailAccessory(icon);
				}
				if (item.button) {
					const button = createButtons(item.button);
					section.addActionRowComponents(new ActionRowBuilder().addComponents(button));
				}

				components.push(section);
			}
		}
		else if (Array.isArray(item)) {
			if (item.every(x => x.img)) {
				const gallery = new MediaGalleryBuilder();

				item.forEach(({ img, desc, spoiler }) => {
					const media = new MediaGalleryItemBuilder().setURL(img);
					if (desc) media.setDescription(desc);
					if (spoiler) media.setSpoiler(true);
					gallery.addItems(media);
				});

				components.push(gallery);
			}
			else {
				const row = new ActionRowBuilder();
				item.forEach(button => row.addComponents(createButtons(button)));

				components.push(row);
			}
		}
		else if (item.file) {
			components.push(new FileBuilder().setURL(item.file));
		}
		else if (item.divider) {
			components.push(new SeparatorBuilder().setDivider(item.divider).setSpacing(item.size === 'small' ? SeparatorSpacingSize.Small : SeparatorSpacingSize.Large));
		}
		else if (item.options) {
			components.push(new ContainerBuilder().addActionRowComponents(new ActionRowBuilder().addComponents(createMenu(item))));
		}
	}

	return {
		flags: MessageFlags.IsComponentsV2 | (ephemeral ? MessageFlags.Ephemeral : 0),
		components,
		allowedMentions: mentions ? undefined : { parse: [], users: [], roles: [], repliedUser: false }
	};
}

createMsg.old = function createMsg({ color, title, desc, fields, header, icon, image, footer, footerIcon, timestamp }) {
	const embed = new EmbedBuilder();

	embed.setColor(color ?? 'FF00FF');
	if (title) embed.setTitle(title);
	if (desc) embed.setDescription(desc);
	if (header) embed.setAuthor({
		name: header.name,
		iconURL: header.icon,
		url: header.url
	});
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

/*

const exampleMessage = createMessage(
	[
		// Messages
		{ content: 'This is a regular text message.' },

		// Buttons (5 per row max)
		[
			{ id: 'exampleButton', label: 'Button', color: 'Green' }, // Colors: Green, Red, Blue, Gray // Optional: replace label with emoji (takes custom emoji id or unicode (if animated, add 'animated: true')), disabled: bool
			{ link: 'https://discord.com', label: 'Link Button' } // Must start with https or discord, Optional: disabled: bool
		],

		// Select Menus
		{},

		// Files
		{ file: 'https://i.imgur.com/wSTFkRM.png' }, // URL or local path ('attachment://${filePath}')
	],
	{ ephemeral: true } // Optional
);

*/
function createMessage(items, { ephemeral = false /* , mentions = true */ } = {}) {
	const components = [];
	const files = [];

	for (const item of items)  {

		// Messages
		if (item.content) {
			components.push({ type: ComponentType.TextDisplay, content: item.content });
		}

		// // Select Menus
		// else if (item.options) {

		// }

		else if (Array.isArray(item)) {
			for (const subitem of item) {

				// Buttons
				if (subitem.label || subitem.emoji) {
					if (subitem.link) {
						const subcomponents = { type: ComponentType.Button, style: ButtonStyle.Link, url: subitem.link, label: subitem.label, disabled: subitem.disabled };
						components.push({ type: ComponentType.ActionRow, components: [subcomponents] });
					}
					else {
						let style;
						if (typeof subitem.color === 'boolean') {
							style = subitem.color ? ButtonStyle.Success : ButtonStyle.Danger;
						}
						else {
							style = buttonColors[subitem.color];
						}

						let emoji;
						if (subitem.emoji) {
							if (/^\d+$/.test(subitem.emoji)) {
								emoji = { id: subitem.emoji };
							}
							else if (/[\p{Emoji}\uFE0F]/u.test(subitem.emoji)) {
								emoji = { name: subitem.emoji };
							}
						}

						const subcomponents = { type: ComponentType.Button, style, custom_id: subitem.id, label: subitem.label, emoji, disabled: subitem.disabled };
						components.push({ type: ComponentType.ActionRow, components: [subcomponents] });
					}
				}
			}
		}

		// Attachments
		else if (item.file) {
			let url;
			if (item.file.startsWith('http')) {
				url = item.file;
			}
			else {
				url = `attachment://${item.file}`;
				files.push({ attachment: path.basename(item.file) });
			}
			components.push({ type: ComponentType.File, file: { url } });
		}
	}

	return {
		flags: MessageFlags.IsComponentsV2 | (ephemeral ? MessageFlags.Ephemeral : 0),
		components,
		files: files.length > 0 ? files : undefined
	};
}

const buttonColors = {
	Blue: ButtonStyle.Primary,
	Gray: ButtonStyle.Secondary,
	Green: ButtonStyle.Success,
	Red: ButtonStyle.Danger
};

function createButtons({ id, label, color, url, emoji, disabled }) {
	if (typeof color === 'boolean') color = color ? 'Green' : 'Red';

	const button = new ButtonBuilder();
	if (disabled) button.setDisabled(true);

	if (url) {
		button.setLabel(label).setURL(url).setStyle(ButtonStyle.Link);
	}
	else {
		if (label) button.setLabel(label);
		if (emoji) button.setEmoji(emoji);
		button.setCustomId(id).setStyle(buttonColors[color]);
	}
	return button;
}

function createMenu({ id, label, options, multi, disabled }) {
	const menu = new StringSelectMenuBuilder().setCustomId(id);
	if (label) menu.setPlaceholder(label);
	if (Array.isArray(multi)) {
		const [min, max] = multi;
		if (min !== null) menu.setMinValues(min);
		if (max !== null) menu.setMaxValues(max);
	}
	if (disabled) menu.setDisabled(true);

	const menuOptions = options.map(({ id, label, desc, emoji, setDefault }) => {
		const option = new StringSelectMenuOptionBuilder().setValue(id).setLabel(label);
		if (desc) option.setDescription(desc);
		if (emoji) option.setEmoji(emoji);
		if (setDefault) option.setDefault(true);
		return option;
	});

	return menu.addOptions(menuOptions);
}

// channel can be Discord channel object or channel ID
function DCsend(channel, message, options = {}) {
	channel = typeof channel === 'string' ? discord.channels.cache.get(channel) : channel;
	return channel.send(createMsg(message, options));
}

// I KNOW THIS CODE IS SHIT BUT I JUST NEED IT TO WORK FOR NOW
// please for the love of god redo this monstrosity
async function updateRoles(uuid) {
	const add = [];
	const remove = [];

	const isLinked = LinkedUsers.find(u => u.uuid === uuid);
	if (!isLinked) return { add, remove };

	const DCmember = getMember(isLinked.dcid);
	if (!DCmember) return { add, remove };

	let guild;
	let player;

	if ((Config.guild.role.enabled || Config.guild.ranks.enabled) && Config.guild.name) {
		guild = await getGuild.player(uuid);
		player = Config.guild.ranks.enabled || Config.customRoles.skyblockLevel.enabled ? await getSkyblock(uuid, { profile: 'highest' }) : null;
	}

	if (Config.guild.role.enabled) {
		const roleID = Config.guild.role.roleID;
		if (!getRole(roleID)) return console.error('Error | updateRoles', 'Invalid Link Role!');

		try {
			if (guild?.name === Config.guild.name && !DCmember.roles.cache.has(roleID)) {
				add.push(roleID);
			}
			else if (guild?.name !== Config.guild.name && DCmember.roles.cache.has(roleID)) {
				remove.push(roleID);

				if (Config.guild.ranks.enabled) {
					const guildRankIDs = Config.guild.ranks.roles.map(r => r.roleID);
					remove.push(...DCmember.roles.cache
						.filter(r => guildRankIDs.includes(r.id))
						.map(r => r.id));
				}
			}
		}
		catch (e) {
			if (e.message.includes('Missing Permissions')) return console.error('Error | updateRoles', 'I don\'t have permission to assign/remove the guild member role!');
			else return console.error('Error | updateRoles', e);
		}
	}

	if (Config.guild.ranks.enabled) {
		if (guild?.name !== Config.guild.name && DCmember.roles.cache.some(r => Config.guild.ranks.roles.map(r => r.roleID).includes(r.id))) {
			remove.push(...DCmember.roles.cache.filter(r => Config.guild.ranks.roles.map(r => r.roleID).includes(r.id)).map(r => r.id));
		}
		else if (guild?.name === Config.guild.name) {
			const whyAreYourRanksNotSortedHypixel = guild.ranks.sort((a, b) => a.priority - b.priority);

			const guildRanks = Config.guild.ranks.roles.map((rank, i) => ({
				name: whyAreYourRanksNotSortedHypixel[i].name,
				roleID: rank.roleID,
				level: Number(rank.level)
			})).filter(r => !isNaN(r.level));

			const rankOld = guild.members.find(p => p.uuid === uuid).rank;
			let rankNew = guildRanks[0].roleID;

			if (!guildRanks.find(r => r.name === rankOld)) {
				rankNew = null;
			}
			else {
				for (const rank of guildRanks) {
					if (player.level >= rank.level) rankNew = rank.roleID;
				}
			}

			if (rankNew) {
				if (!getRole(rankNew)) return console.error('! Guild Ranks', `Invalid guild rank role! (ID: ${rankNew})`);
				if (!DCmember.roles.cache.has(rankNew)) {
					add.push(rankNew);
				}

				for (const rank of guildRanks) {
					if (rank.roleID !== rankNew && DCmember.roles.cache.has(rank.roleID)) {
						remove.push(rank.roleID);
					}
				}
			}
		}
	}

	if (Config.customRoles.skyblockLevel.enabled) {
		let roleNew = Config.customRoles.skyblockLevel.roles[0].roleID;
		for (const role of Config.customRoles.skyblockLevel.roles) {
			if (!getRole(role.roleID)) return console.error('! Custom Roles', `Invalid role ID for Skyblock level ${role.level}! (ID: ${role.roleID})`);
			if (isNaN(role.level)) return console.error('! Custom Roles', `Invalid level for Skyblock level role ID ${role.roleID}!`);

			if (player.level >= role.level) roleNew = role.roleID;
		}

		if (!DCmember.roles.cache.has(roleNew)) {
			const role = getRole(roleNew);
			add.push(role.id);
		}

		for (const role of Config.customRoles.skyblockLevel.roles) {
			const roleOld = getRole(role.roleID);
			if (roleOld.id !== roleNew && DCmember.roles.cache.has(roleOld.id)) {
				remove.push(roleOld.id);
			}
		}
	}

	return { add, remove };
}
