import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, FileBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, PermissionFlagsBits, resolveColor, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextDisplayBuilder, ThumbnailBuilder } from 'discord.js';
import { discord } from '../../discord/Discord.js';
import { config } from './config.js';

export {
	createSlash,
	getChannel,
	getRole,
	getMember,
	getEmoji,
	createMsg,
	DCsend
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
	return getChannel(config.logs.bot.channelID).guild.roles.cache.get(role);
}

function getMember(member) {
	return getChannel(config.logs.bot.channelID).guild.members.cache.get(member);
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
				else if (embed.file) {
					container.addFileComponents(new FileBuilder().setURL(embed.file));
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

const styles = {
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
		button.setURL(url).setStyle(ButtonStyle.Link);
	}
	else {
		if (label) button.setLabel(label);
		if (emoji) button.setEmoji(emoji);
		button.setCustomId(id).setStyle(styles[color]);
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
