import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, EmbedBuilder, FileBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, PermissionFlagsBits, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextDisplayBuilder, ThumbnailBuilder, resolveColor } from 'discord.js'
import { discord } from '../discord/Discord.js'
import path from 'path'
import { config, saveConfig, UnknownError, UserError } from '#utils'

export {
	createMessage,
	createMessageLegacy,
	getServer,
	getChannel,
	DCsend,
	DiscordChannels
}

function createMessage(items, { ephemeral = false, mentions = true } = {}) {
	const components = []
	const files = []

	for (const item of items) {
		if (item.embed) {
			const container = new ContainerBuilder()
			if (item.color) container.setAccentColor(resolveColor(item.color))
			if (item.spoiler) container.setSpoiler(true)

			for (const embedItem of item.embed) {
				if (embedItem.desc) {
					const lines = Array.isArray(embedItem.desc) ? embedItem.desc : [embedItem.desc]

					if (embedItem.icon || embedItem.button) {
						const section = new SectionBuilder()

						lines.forEach(line => {
							section.addTextDisplayComponents(new TextDisplayBuilder().setContent(line))
						})

						if (embedItem.icon) {
							const icon = new ThumbnailBuilder()
							if (/^https?:\/\//i.test(embedItem.icon)) {
								icon.setURL(embedItem.icon)
							}
							else {
								files.push(new AttachmentBuilder(embedItem.icon))
								icon.setURL(`attachment://${path.basename(embedItem.icon)}`)
							}
							if (embedItem.iconDesc) icon.setDescription(embedItem.iconDesc)
							if (embedItem.iconSpoiler) icon.setSpoiler(true)
							section.setThumbnailAccessory(icon)
						}
						else if (embedItem.button) {
							section.setButtonAccessory(createButton(embedItem.button))
						}

						container.addSectionComponents(section)
					}
					else {
						lines.forEach(line => {
							container.addTextDisplayComponents(new TextDisplayBuilder().setContent(line))
						})
					}
				}
				else if (embedItem.images) {
					const gallery = new MediaGalleryBuilder()

					if (typeof embedItem.images === 'string') {
						if (/^https?:\/\//i.test(embedItem.images)) {
							gallery.addItems(new MediaGalleryItemBuilder().setURL(embedItem.images))
						}
						else {
							files.push(new AttachmentBuilder(embedItem.images))
							gallery.addItems(new MediaGalleryItemBuilder().setURL(`attachment://${path.basename(embedItem.images)}`))
						}
					}
					else if (Array.isArray(embedItem.images)) {
						for (const image of embedItem.images) {
							if (typeof image === 'string') {
								if (/^https?:\/\//i.test(image)) {
									gallery.addItems(new MediaGalleryItemBuilder().setURL(image))
								}
								else {
									files.push(new AttachmentBuilder(image))
									gallery.addItems(new MediaGalleryItemBuilder().setURL(`attachment://${path.basename(image)}`))
								}
							}
							else if (typeof image === 'object') {
								let media
								if (/^https?:\/\//i.test(image.link)) {
									media = new MediaGalleryItemBuilder().setURL(image.link)
								}
								else {
									files.push(new AttachmentBuilder(image.link))
									media = new MediaGalleryItemBuilder().setURL(`attachment://${path.basename(image.link)}`)
								}

								if (image.desc) media.setDescription(image.desc)
								if (image.spoiler) media.setSpoiler(true)
								gallery.addItems(media)
							}
						}
					}
					else {
						let media

						if (/^https?:\/\//i.test(embedItem.images.link)) {
							media = new MediaGalleryItemBuilder().setURL(embedItem.images.link)
						}
						else {
							files.push(new AttachmentBuilder(embedItem.images.link))
							media = new MediaGalleryItemBuilder().setURL(`attachment://${path.basename(embedItem.images.link)}`)
						}

						if (embedItem.images.desc) media.setDescription(embedItem.images.desc)
						if (embedItem.images.spoiler) media.setSpoiler(true)
						gallery.addItems(media)
					}

					container.addMediaGalleryComponents(gallery)
				}
				else if (embedItem.buttons) {
					const row = new ActionRowBuilder()
					embedItem.buttons.forEach(button => row.addComponents(createButton(button)))
					container.addActionRowComponents(row)
				}
				else if (embedItem.menu) {
					container.addActionRowComponents(new ActionRowBuilder().addComponents(createMenu(embedItem.menu)))
				}
				else if (embedItem.file) {
					files.push(new AttachmentBuilder(embedItem.file))
					container.addFileComponents(new FileBuilder().setURL(`attachment://${path.basename(embedItem.file)}`))
				}
				else if (embedItem.divider !== undefined) {
					const divider = new SeparatorBuilder()

					switch (embedItem.divider) {
						case 0:
							divider.setDivider(false)
							break
						case 1:
							divider.setSpacing(SeparatorSpacingSize.Small)
							break
						case 2:
							divider.setSpacing(SeparatorSpacingSize.Large)
							break
					}

					container.addSeparatorComponents(divider)
				}
			}

			components.push(container)
		}
		else if (item.desc) {
			const lines = Array.isArray(item.desc) ? item.desc : [item.desc]

			if (item.icon || item.button) {
				const section = new SectionBuilder()

				lines.forEach(line => {
					section.addTextDisplayComponents(new TextDisplayBuilder().setContent(line))
				})

				if (item.icon) {
					const icon = new ThumbnailBuilder()
					if (/^https?:\/\//i.test(item.icon)) {
						icon.setURL(item.icon)
					}
					else {
						files.push(new AttachmentBuilder(item.icon))
						icon.setURL(`attachment://${path.basename(item.icon)}`)
					}
					if (item.iconDesc) icon.setDescription(item.iconDesc)
					if (item.iconSpoiler) icon.setSpoiler(true)
					section.setThumbnailAccessory(icon)
				}
				else if (item.button) {
					section.setButtonAccessory(createButton(item.button))
				}

				components.push(section)
			}
			else {
				lines.forEach(line => {
					components.push(new TextDisplayBuilder().setContent(line))
				})
			}
		}
		else if (item.images) {
			const gallery = new MediaGalleryBuilder()

			if (typeof item.images === 'string') {
				if (/^https?:\/\//i.test(item.images)) {
					gallery.addItems(new MediaGalleryItemBuilder().setURL(item.images))
				}
				else {
					files.push(new AttachmentBuilder(item.images))
					gallery.addItems(new MediaGalleryItemBuilder().setURL(`attachment://${path.basename(item.images)}`))
				}
			}
			else if (Array.isArray(item.images)) {
				for (const image of item.images) {
					if (typeof image === 'string') {
						if (/^https?:\/\//i.test(image)) {
							gallery.addItems(new MediaGalleryItemBuilder().setURL(image))
						}
						else {
							files.push(new AttachmentBuilder(image))
							gallery.addItems(new MediaGalleryItemBuilder().setURL(`attachment://${path.basename(image)}`))
						}
					}
					else if (typeof image === 'object') {
						let media
						if (/^https?:\/\//i.test(image.link)) {
							media = new MediaGalleryItemBuilder().setURL(image.link)
						}
						else {
							files.push(new AttachmentBuilder(image.link))
							media = new MediaGalleryItemBuilder().setURL(`attachment://${path.basename(image.link)}`)
						}

						if (image.desc) media.setDescription(image.desc)
						if (image.spoiler) media.setSpoiler(true)
						gallery.addItems(media)
					}
				}
			}
			else {
				let media

				if (/^https?:\/\//i.test(item.images.link)) {
					media = new MediaGalleryItemBuilder().setURL(item.images.link)
				}
				else {
					files.push(new AttachmentBuilder(item.images.link))
					media = new MediaGalleryItemBuilder().setURL(`attachment://${path.basename(item.images.link)}`)
				}

				if (item.images.desc) media.setDescription(item.images.desc)
				if (item.images.spoiler) media.setSpoiler(true)
				gallery.addItems(media)
			}

			components.push(gallery)
		}
		else if (item.buttons) {
			const row = new ActionRowBuilder()
			item.buttons.forEach(button => row.addComponents(createButton(button)))
			components.push(row)
		}
		else if (item.menu) {
			components.push(new ContainerBuilder().addActionRowComponents(new ActionRowBuilder().addComponents(createMenu(item.menu))))
		}
		else if (item.file) {
			files.push(new AttachmentBuilder(item.file))
			components.push(new FileBuilder().setURL(`attachment://${path.basename(item.file)}`))
		}
		else if (item.divider !== undefined) {
			const divider = new SeparatorBuilder()

			switch (item.divider) {
				case 0:
					divider.setDivider(false)
					break
				case 1:
					divider.setSpacing(SeparatorSpacingSize.Small)
					break
				case 2:
					divider.setSpacing(SeparatorSpacingSize.Large)
					break
			}

			components.push(divider)
		}
	}

	return {
		flags: MessageFlags.IsComponentsV2 | (ephemeral ? MessageFlags.Ephemeral : 0),
		components,
		files,
		allowedMentions: mentions ? undefined : { parse: [], users: [], roles: [], repliedUser: false }
	}
}

function createMessageLegacy({ color, title, desc, fields, header, icon, image, footer, footerIcon, timestamp }) {
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

function createButton({ id, label, color, url, emoji, disabled }) {
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

const DiscordChannels = {
	Bot: { id: config.logs?.bot?.channelID ?? null, name: 'Bot Logs Channel' },
	Console: { id: config.logs?.console?.channelID ?? null, name: 'Console Logs Channel' },
	Tickets: { id: config.logs?.tickets?.channelID ?? null, name: 'Ticket Logs Channel' },
	Welcome: { id: config.discord?.memberJoin?.welcomeMessage?.channelID ?? null, name: 'Welcome Channel' },
	SkyblockNews: { id: config.discord?.skyblockNews?.channelID ?? null, name: 'News Channel' },
	GuildChatBridge: { id: config.minecraft?.bridge?.guildChat?.channelID ?? null, name: 'Guild Chat Bridge' },
	OfficerChatBridge: { id: config.minecraft?.bridge?.officerChat?.channelID ?? null, name: 'Officer Chat Bridge' }
}

async function DCsend(channel, message, options = {}) {
	let channelID = null
	let channelName = null

	if (typeof channel === 'object') {
		channelID = channel.id
		channelName = channel.name
	}
	else if (typeof channel === 'string') {
		channelID = channel

		const knownChannel = Object.values(DiscordChannels).find(c => c.id === channelID)
		if (knownChannel) {
			channelName = knownChannel.name
		}
	}

	try {
		const validChannel = getChannel(channelID)
		if (validChannel) {
			await validChannel.send(createMessage(message, options))
		}
		else {
			if (channelName) {
				await validateChannel(channelName)
				const newChannel = getChannel(Object.values(DiscordChannels).find(c => c.name === channelName).id)
				await newChannel.send(createMessage(message, options))
			}
			else {
				throw new UserError({ message: `Invalid Channel ID | ${channelName ?? channelID}` })
			}
		}
	}
	catch (e) {
		if (e instanceof UserError) throw e
		throw new UnknownError({ cause: e })
	}
}

async function validateChannel(channel) {
	const guild = config.serverID
	if (!guild) throw new UserError({ message: 'Invalid Server ID' })
	const validGuild = getServer(guild)

	const knownChannel = Object.values(DiscordChannels).find(c => c.name === channel)
	if (knownChannel) {
		if (knownChannel.name === 'Bot Logs Channel' || knownChannel.name === 'Console Logs Channel' || knownChannel.name === 'Ticket Logs Channel') {
			let logsChannel = getChannel(config.logs.channelID)

			if (!logsChannel) {
				const channel = await validGuild.channels.create({
					name: 'logs',
					type: 0,
					permissionOverwrites: [{
						id: validGuild.roles.everyone.id,
						deny: PermissionFlagsBits.ViewChannel
					}]
				})

				config.logs.channelID = channel.id
				saveConfig()

				logsChannel = getChannel(config.logs.channelID)
			}

			if (knownChannel.name === 'Bot Logs Channel') {
				const botLogsThread = await logsChannel.threads.create({ name: 'Bot' })
				config.logs.bot.channelID = botLogsThread.id
				DiscordChannels.Bot.id = botLogsThread.id
				saveConfig()
			}
			else if (knownChannel.name === 'Console Logs Channel') {
				const consoleLogsThread = await logsChannel.threads.create({ name: 'Console' })
				config.logs.console.channelID = consoleLogsThread.id
				DiscordChannels.Console.id = consoleLogsThread.id
				saveConfig()

				saveConfig()
			}
			else if (knownChannel.name === 'Ticket Logs Channel') {
				const ticketLogsThread = await logsChannel.threads.create({ name: 'Tickets' })
				config.logs.tickets.channelID = ticketLogsThread.id
				DiscordChannels.Tickets.id = ticketLogsThread.id
				saveConfig()
			}
		}
	}
}