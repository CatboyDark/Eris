import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, FileBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, PermissionFlagsBits, resolveColor, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextDisplayBuilder, ThumbnailBuilder } from 'discord.js';
import { discord } from '../../discord/Discord.js';

export {
	createSlash,
	getChannel,
	getEmoji,
	createMsg,
	DCsend
};

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

function getChannel(channel) {
	return discord.channels.cache.get(channel);
}

async function getEmoji(name) {
	const app = await discord.application.emojis.fetch();
	const emoji = app.find(e => e.name === name);
	if (!emoji) return console.red(`Invalid Emoji: ${name}`);

	return emoji;
}

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
function createMsg(items = []) {
	const components = [];

	for (const item of items) {
		if (item.desc || item.icon || item.button) {
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
		else if (item.embed) {
			const container = new ContainerBuilder();
			if (item.color) container.setAccentColor(resolveColor(item.color));
			if (item.spoiler) container.setSpoiler(true);

			const embed = createMsg(item.embed).components;
			for (const item of embed) {
				if (item instanceof TextDisplayBuilder) {
					container.addTextDisplayComponents(item);
				}
				else if (item instanceof SectionBuilder) {
					container.addSectionComponents(item);
				}
				else if (item instanceof ActionRowBuilder) {
					container.addActionRowComponents(item);
				}
				else if (item instanceof MediaGalleryBuilder) {
					container.addMediaGalleryComponents(item);
				}
				else if (item instanceof SeparatorBuilder) {
					container.addSeparatorComponents(item);
				}
				else if (item instanceof FileBuilder) {
					container.addFileComponents(item);
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
			components.push(new ContainerBuilder().addActionRowComponents(new ActionRowBuilder().addComponents(createSelectMenu(item))));
		}
	}

	return {
		flags: MessageFlags.IsComponentsV2,
		components
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

function createSelectMenu({ id, label, options, min, max, disabled }) {
	const selectMenu = new StringSelectMenuBuilder().setCustomId(id);
	if (label) selectMenu.setPlaceholder(label);
	if (min) selectMenu.setMinValues(min);
	if (max) selectMenu.setMaxValues(max);
	if (disabled) selectMenu.setDisabled(true);

	const selectMenuOptions = options.map(({ id, label, desc, emoji, setDefault }) => {
		const option = new StringSelectMenuOptionBuilder().setValue(id).setLabel(label);
		if (desc) option.setDescription(desc);
		if (emoji) option.setEmoji(emoji);
		if (setDefault) option.setDefault(true);
		return option;
	});

	return selectMenu.addOptions(selectMenuOptions);
}

function DCsend(channelID, message) {
	return discord.channels.cache.get(channelID).send(createMsg(message));
}
