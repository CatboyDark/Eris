import { config, DiscordInvalidChannelError, DiscordInvalidMemberError, DiscordInvalidRoleError, DiscordInvalidServerError, DiscordMissingServerError, UnknownError } from '#utils'
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, EmbedBuilder, FileBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, PermissionFlagsBits, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextDisplayBuilder, ThumbnailBuilder, resolveColor } from 'discord.js'
import path from 'path'

export {
	discord
}

class Discord {
	constructor() {
		this.bot = null
	}

	get channels() {
		return {
			BOT: { id: config.logs?.bot?.channelID ?? null, name: 'Bot Logs Channel' },
			CONSOLE: { id: config.logs?.console?.channelID ?? null, name: 'Console Logs Channel' },
			TICKETS: { id: config.logs?.tickets?.channelID ?? null, name: 'Ticket Logs Channel' },
			WELCOME: { id: config.welcome?.discord?.channelID ?? null, name: 'Welcome Channel' },
			SKYBLOCKNEWS: { id: config.skyblockNews?.discord?.channelID ?? null, name: 'Skyblock News Channel' },
			GUILD_CHAT_BRIDGE: { id: config.chatBridge?.guildChat?.channelID ?? null, name: 'Guild Chat Bridge Channel' },
			OFFICER_CHAT_BRIDGE: { id: config.chatBridge?.officerChat?.channelID ?? null, name: 'Officer Chat Bridge Channel' }
		}
	}

	createMessage(items, { ephemeral = false, mentions = true } = {}) {
		const components = []
		const files = []

		for (const item of items) {
			if (item.embed) {
				const container = new ContainerBuilder()
				if (item.color) container.setAccentColor(resolveColor(item.color))
				if (item.spoiler) container.setSpoiler(true)

				for (const embedItem of item.embed) {
					if (embedItem.description) {
						const lines = Array.isArray(embedItem.description) ? embedItem.description : [embedItem.description]

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
								if (embedItem.iconDescription) icon.setDescription(embedItem.iconDescription)
								if (embedItem.iconSpoiler) icon.setSpoiler(true)
								section.setThumbnailAccessory(icon)
							}
							else if (embedItem.button) {
								section.setButtonAccessory(this.#createButton(embedItem.button))
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

									if (image.description) media.setDescription(image.description)
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

							if (embedItem.images.description) media.setDescription(embedItem.images.description)
							if (embedItem.images.spoiler) media.setSpoiler(true)
							gallery.addItems(media)
						}

						container.addMediaGalleryComponents(gallery)
					}
					else if (embedItem.buttons) {
						const row = new ActionRowBuilder()
						embedItem.buttons.forEach(button => row.addComponents(this.#createButton(button)))
						container.addActionRowComponents(row)
					}
					else if (embedItem.menu) {
						container.addActionRowComponents(new ActionRowBuilder().addComponents(this.#createMenu(embedItem.menu)))
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
			else if (item.description) {
				const lines = Array.isArray(item.description) ? item.description : [item.description]

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
						if (item.iconDescription) icon.setDescription(item.iconDescription)
						if (item.iconSpoiler) icon.setSpoiler(true)
						section.setThumbnailAccessory(icon)
					}
					else if (item.button) {
						section.setButtonAccessory(this.#createButton(item.button))
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

							if (image.description) media.setDescription(image.description)
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

					if (item.images.description) media.setDescription(item.images.description)
					if (item.images.spoiler) media.setSpoiler(true)
					gallery.addItems(media)
				}

				components.push(gallery)
			}
			else if (item.buttons) {
				const row = new ActionRowBuilder()
				item.buttons.forEach(button => row.addComponents(this.#createButton(button)))
				components.push(row)
			}
			else if (item.menu) {
				components.push(new ContainerBuilder().addActionRowComponents(new ActionRowBuilder().addComponents(this.#createMenu(item.menu))))
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

	createMessageLegacy({ color, title, description, fields, header, icon, image, footer, footerIcon, timestamp }) {
		const embed = new EmbedBuilder()

		embed.setColor(color ?? '#FF00FF')
		if (title) embed.setTitle(title)
		if (description) embed.setDescription(description)
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
					value: field.description,
					inline: field.inline || false
				})
			}
			)
		}
		if (timestamp) embed.setTimestamp()
		return embed
	}

	#createButton({ id, label, color, url, emoji, disabled }) {
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

	#createMenu({ id, label, options, multi, disabled }) {
		const menu = new StringSelectMenuBuilder().setCustomId(id)
		if (label) menu.setPlaceholder(label)
		if (Array.isArray(multi)) {
			const [min, max] = multi
			if (min !== null) menu.setMinValues(min)
			if (max !== null) menu.setMaxValues(max)
		}
		if (disabled) menu.setDisabled(true)

		const menuOptions = options.map(({ id, label, description, emoji, setDefault }) => {
			const option = new StringSelectMenuOptionBuilder().setValue(id).setLabel(label)
			if (description) option.setDescription(description)
			if (emoji) option.setEmoji(emoji)
			if (setDefault) option.setDefault(true)
			return option
		})

		return menu.addOptions(menuOptions)
	}

	getServer(server) {
		const targetServer = typeof server === 'string' ? this.bot.guilds.cache.get(server) : server
		if (!targetServer) throw new DiscordInvalidServerError({ serverID: server })

		return targetServer
	}

	getChannel(channel) {
		const targetChannel = typeof channel === 'string' ? this.bot.channels.cache.get(channel) : channel
		if (!targetChannel) throw new DiscordInvalidChannelError({ channelID: channel })

		return targetChannel
	}

	getRole(role) {
		const server = this.getServer(config.serverID)
		const targetRole = typeof role === 'string' ? server.roles.cache.get(role) : role
		if (!targetRole) throw new DiscordInvalidRoleError({ roleID: role })

		return targetRole
	}

	getMember(member) {
		const server = this.getServer(config.serverID)
		const targetMember = typeof member === 'string' ? server.members.cache.get(member) : member
		if (!targetMember) throw new DiscordInvalidMemberError(member)

		return targetMember
	}

	async send(channel, message, options = {}) {
		let channelID = null
		let channelName = null

		if (typeof channel === 'object') {
			channelID = channel.id
			channelName = channel.name
		}
		else if (typeof channel === 'string') {
			channelID = channel

			const knownChannel = Object.values(this.channels).find(c => c.id === channelID)
			if (knownChannel) {
				channelName = knownChannel.name
			}
		}

		try {
			const channel = this.getChannel(channelID)
			if (channel) {
				await channel.send(this.createMessage(message, options))
			}
			else {
				if (channelName) {
					await this.#validateChannel(channelName)
					const newChannel = this.getChannel(Object.values(this.channels).find(c => c.name === channelName).id)
					await newChannel.send(this.createMessage(message, options))
				}
				else {
					throw new DiscordInvalidChannelError({ channelName, channelID })
				}
			}
		}
		catch (e) {
			if (e instanceof DiscordInvalidChannelError) throw new DiscordInvalidChannelError({ channelID, channelName, cause: e })
			if (e instanceof DiscordMissingServerError) throw e
			throw new UnknownError({ cause: e })
		}
	}

	async #validateChannel(channel) {
		const guild = config.serverID
		if (!guild) throw new DiscordMissingServerError()
		const validGuild = this.getServer(guild)
		if (!validGuild) throw new DiscordInvalidServerError(guild)

		const knownChannel = Object.values(this.channels).find(c => c.name === channel)
		if (knownChannel) {
			if (
				knownChannel.name === 'Bot Logs Channel' ||
				knownChannel.name === 'Console Logs Channel' ||
				knownChannel.name === 'Ticket Logs Channel'
			) {
				let logsChannel = this.getChannel(config.logs.channelID)

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
					config.write()

					logsChannel = this.getChannel(config.logs.channelID)
				}

				if (knownChannel.name === 'Bot Logs Channel') {
					const botLogsThread = await logsChannel.threads.create({ name: 'Bot' })
					config.logs.bot.channelID = botLogsThread.id
					this.channels.BOT.id = botLogsThread.id
					config.write()
				}
				else if (knownChannel.name === 'Console Logs Channel') {
					const consoleLogsThread = await logsChannel.threads.create({ name: 'Console' })
					config.logs.console.channelID = consoleLogsThread.id
					this.channels.CONSOLE.id = consoleLogsThread.id
					config.write()

					config.write()
				}
				else if (knownChannel.name === 'Ticket Logs Channel') {
					const ticketLogsThread = await logsChannel.threads.create({ name: 'Tickets' })
					config.logs.tickets.channelID = ticketLogsThread.id
					this.channels.TICKETS.id = ticketLogsThread.id
					config.write()
				}
			}
		}
	}
}

const discord = new Discord()

const buttonColors = {
	Blue: ButtonStyle.Primary,
	Gray: ButtonStyle.Secondary,
	Green: ButtonStyle.Success,
	Red: ButtonStyle.Danger
}