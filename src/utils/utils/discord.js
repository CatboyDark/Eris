import { ActionRowBuilder, ButtonStyle, ContainerBuilder, FileBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, PermissionFlagsBits, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from 'discord.js';
import { discord } from '../../discord/Discord.js';

export {
	getChannel,
	createSlash,
	createMsg
};

function getChannel(channel) {
	return discord.channels.cache.get(channel);
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

function createMsg(items = []) {
	const components = [];

	for (const item of items) {
		if (item.desc || item.icon || item.button) {
			const section = new SectionBuilder();

			if (item.desc) {
				const text = Array.isArray(item.desc) ? item.desc : [item.desc];
				text.forEach(line => section.addTextDisplayComponents(new TextDisplayBuilder().setContent(line)));
			}
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
		flags: 32768,
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
