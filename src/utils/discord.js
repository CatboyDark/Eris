import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, EmbedBuilder, FileBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, resolveColor, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextDisplayBuilder, ThumbnailBuilder } from 'discord.js'
import { discord } from '../discord/Discord.js'
import { Config } from '#utils'

export {
	createMessage,
	createMessageV1,
	DCsend,
	getServer,
	getChannel
}

function createMessage(items, { ephemeral = false, mentions = true } = {}) {
	const components = []
	const files = []

	for (const item of items) {
		if (item.embed) {
			const container = new ContainerBuilder()
			if (item.color) {
				if (item.color in colors) container.setAccentColor(resolveColor(colors[item.color]))
				else container.setAccentColor(resolveColor(item.color))
			}
			if (item.spoiler) container.setSpoiler(true)

			for (const embed of item.embed) {
				if (embed.desc || embed.icon || embed.button) {
					const lines = Array.isArray(embed.desc) ? embed.desc : [embed.desc]

					if (!embed.icon && !embed.button) {
						lines.forEach(line => {
							container.addTextDisplayComponents(new TextDisplayBuilder().setContent(line))
						})
					}
					else {
						const section = new SectionBuilder()
						lines.forEach(line => {
							section.addTextDisplayComponents(new TextDisplayBuilder().setContent(line))
						})

						if (embed.icon) {
							const icon = new ThumbnailBuilder().setURL(embed.icon.url)
							if (embed.icon.desc) icon.setDescription(embed.icon.desc)
							if (embed.icon.spoiler) icon.setSpoiler(true)
							section.setThumbnailAccessory(icon)
						}
						if (embed.button) {
							const button = createButtons(embed.button)
							section.addActionRowComponents(new ActionRowBuilder().addComponents(button))
						}

						container.addSectionComponents(section)
					}
				}
				else if (embed.options) {
					container.addActionRowComponents(new ActionRowBuilder().addComponents(createMenu(embed)))
				}
				else if (Array.isArray(embed)) {
					if (embed.every(x => x.img)) {
						const gallery = new MediaGalleryBuilder()

						embed.forEach(({ img, desc, spoiler }) => {
							const media = new MediaGalleryItemBuilder().setURL(img)
							if (desc) media.setDescription(desc)
							if (spoiler) media.setSpoiler(true)
							gallery.addItems(media)
						})

						container.addMediaGalleryComponents(gallery)
					}
					else {
						const row = new ActionRowBuilder()
						embed.forEach(button => row.addComponents(createButtons(button)))

						container.addActionRowComponents(row)
					}
				}
				else if (item.file) {
					if (/^https?:\/\//i.test(item.file)) {
						components.push(new FileBuilder().setURL(item.file))
					}
					else {
						const filename = require('path').basename(item.file)
						files.push(new AttachmentBuilder(item.file))
						components.push(new FileBuilder().setURL(`attachment://${filename}`))
					}
				}
				else if (embed.divider) {
					container.addSectionComponents(new SeparatorBuilder().setDivider(embed.divider).setSpacing(embed.size === 'small' ? SeparatorSpacingSize.Small : SeparatorSpacingSize.Large))
				}
			}
			if (item.timestamp) {
				let timestamp
				if (item.timestamp === 'r') timestamp = `<t:${Math.floor(Date.now() / 1000)}:R>`
				else if (item.timestamp === 'f') timestamp = `<t:${Math.floor(Date.now() / 1000)}:f>`
				container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`_ _\n-# ${timestamp}`))
			}
			components.push(container)
		}
		else if (item.desc || item.icon || item.button) {
			const lines = Array.isArray(item.desc) ? item.desc : [item.desc]

			if (!item.icon && !item.button) {
				lines.forEach(line => {
					components.push(new TextDisplayBuilder().setContent(line))
				})
			}
			else {
				const section = new SectionBuilder()

				lines.forEach(line => {
					section.addTextDisplayComponents(new TextDisplayBuilder().setContent(line))
				})

				if (item.icon) {
					const icon = new ThumbnailBuilder().setURL(item.icon.url)
					if (item.icon.desc) icon.setDescription(item.icon.desc)
					if (item.icon.spoiler) icon.setSpoiler(true)
					section.setThumbnailAccessory(icon)
				}
				if (item.button) {
					const button = createButtons(item.button)
					section.addActionRowComponents(new ActionRowBuilder().addComponents(button))
				}

				components.push(section)
			}
		}
		else if (Array.isArray(item)) {
			if (item.every(x => x.img)) {
				const gallery = new MediaGalleryBuilder()

				item.forEach(({ img, desc, spoiler }) => {
					const media = new MediaGalleryItemBuilder().setURL(img)
					if (desc) media.setDescription(desc)
					if (spoiler) media.setSpoiler(true)
					gallery.addItems(media)
				})

				components.push(gallery)
			}
			else {
				const row = new ActionRowBuilder()
				item.forEach(button => row.addComponents(createButtons(button)))

				components.push(row)
			}
		}
		else if (item.file) {
			components.push(new FileBuilder().setURL(item.file))
		}
		else if (item.divider) {
			components.push(new SeparatorBuilder().setDivider(item.divider).setSpacing(item.size === 'small' ? SeparatorSpacingSize.Small : SeparatorSpacingSize.Large))
		}
		else if (item.options) {
			components.push(new ContainerBuilder().addActionRowComponents(new ActionRowBuilder().addComponents(createMenu(item))))
		}
	}

	return {
		flags: MessageFlags.IsComponentsV2 | (ephemeral ? MessageFlags.Ephemeral : 0),
		components,
		allowedMentions: mentions ? undefined : { parse: [], users: [], roles: [], repliedUser: false }
	}
}

function createMessageV1({ color, title, desc, fields, header, icon, image, footer, footerIcon, timestamp }) {
	const embed = new EmbedBuilder()

	embed.setColor(color ?? 'FF00FF')
	if (title) embed.setTitle(title)
	if (desc) embed.setDescription(desc)
	if (header) embed.setAuthor({
		name: header.name,
		iconURL: header.icon,
		url: header.url
	})
	if (icon) embed.setThumbnail(icon)
	if (image) embed.setImage(image)
	if (footer) embed.setFooter({ text: footer, iconURL: footerIcon })
	if (fields) {
		fields.forEach(field => {
			embed.addFields({
				name: field.title,
				value: field.desc,
				inline: field.inline || false
			})
		}
		)
	}
	if (timestamp) embed.setTimestamp()
	return embed
}

const buttonColors = {
	Blue: ButtonStyle.Primary,
	Gray: ButtonStyle.Secondary,
	Green: ButtonStyle.Success,
	Red: ButtonStyle.Danger
}

function createButtons({ id, label, color, url, emoji, disabled }) {
	if (typeof color === 'boolean') color = color ? 'Green' : 'Red'

	const button = new ButtonBuilder()
	if (disabled) button.setDisabled(true)

	if (url) {
		button.setLabel(label).setURL(url).setStyle(ButtonStyle.Link)
	}
	else {
		if (label) button.setLabel(label)
		if (emoji) button.setEmoji(emoji)
		button.setCustomId(id).setStyle(buttonColors[color])
	}
	return button
}

function createMenu({ id, label, options, multi, disabled }) {
	const menu = new StringSelectMenuBuilder().setCustomId(id)
	if (label) menu.setPlaceholder(label)
	if (Array.isArray(multi)) {
		const [min, max] = multi
		if (min !== null) menu.setMinValues(min)
		if (max !== null) menu.setMaxValues(max)
	}
	if (disabled) menu.setDisabled(true)

	const menuOptions = options.map(({ id, label, desc, emoji, setDefault }) => {
		const option = new StringSelectMenuOptionBuilder().setValue(id).setLabel(label)
		if (desc) option.setDescription(desc)
		if (emoji) option.setEmoji(emoji)
		if (setDefault) option.setDefault(true)
		return option
	})

	return menu.addOptions(menuOptions)
}

function getServer(server) {
	return typeof server === 'string' ? discord.guilds.cache.get(server) : server
}

/**
	@param {string | import('discord.js').Channel} channel
*/
function getChannel(channel) {
	return typeof channel === 'string' ? discord.channels.cache.get(channel) : channel
}

const channels = [
	{ id: Config.logs.bot.channelID, label: 'Bot Log' },
	{ id: Config.minecraft.console.channelID, label: 'Console Log' },
	{ id: Config.logs.tickets.channelID, label: 'Ticket Log' },
	{ id: Config.welcome.message.channelID, label: 'Welcome Channel' },
	{ id: Config.skyblockNews.channelID, label: 'News Channel' },
	{ id: Config.minecraft.bridge.guild.channelID, label: 'Guild Chat Bridge' },
	{ id: Config.minecraft.bridge.officer.channelID, label: 'Officer Chat Bridge' }
]

function DCsend(channel, message, options = {}) {
	const validChannel = getChannel(channel)
	if (validChannel) {
		try {
			validChannel.send(createMessage(message, options))
		}
		catch(e) {
			if (e.message.startsWith('Cannot read properties of undefined')) {
				const channelExists = channels.includes(key => key.id === channel)
				if (!channelExists) {
					return console.error(`Invalid Channel | ${channelExists.label}`)
				}
			}
			else {
				return console.error('DCsend', e)
			}
		}
	}
	else {
		return console.error(`Invalid Channel | ${channel}`)
	}
}