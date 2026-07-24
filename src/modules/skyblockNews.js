import { config, discord, DiscordInvalidRoleError, read } from '#utils'
import * as cheerio from 'cheerio'
import Parser from 'rss-parser'

const feeds = {
	// hypixelForums: 'https://hypixel.net/forums/-/index.rss';
	skyblockGeneralDiscussion: 'https://hypixel.net/forums/skyblock-general-discussion.157/index.rss?order=post_date',
	skyblockAnnouncements: 'https://hypixel.net/forums/news-and-announcements.4/index.rss?order=post_date',
	skyblockPatchNotes: 'https://hypixel.net/forums/skyblock-patch-notes.158/index.rss?order=post_date',
	skyblockAlphaNetwork: 'https://hypixel.net/skyblock-alpha/index.rss?order=post_date'
}

const staff = read('assets/hypixelStaff.jsonc')

const parser = new Parser()

export async function skyblockNews() {
	if 	(!config.skyblockNews.discord.enabled && !config.skyblockNews.minecraft.enabled) return

	const cache = read('.cache/bot/skyblockNews.json')

	for (const [key, value] of Object.entries(feeds)) {
		const feed = await parser.parseURL(value)

		const validItems = feed.items.reverse().filter(item => {
			if (key === 'skyblockAnnouncements' && !item.title.toLowerCase().includes('skyblock')) return false
			if (key === 'skyblockAlphaNetwork' && !Object.values(staff).includes(item.creator)) return false
			if (key === 'skyblockGeneralDiscussion' && !Object.values(staff).includes(item.creator)) return false
			return true
		})

		if (!cache[key]) {
			cache[key] = validItems[0]?.isoDate ?? '1970-01-01T00:00:00.000Z'
			cache.write()

			// If this is the first run, avoid old posts flooding.
			continue
		}

		const newItems = validItems.reverse().filter(item => item.isoDate > cache[key])

		for (const item of newItems) {
			if (config.skyblockNews.discord.enabled) {
				const $ = cheerio.load(item['content:encoded'])

				const parts = []

				if (config.skyblockNews.discord.notifyRole) {
					try {
						const role = discord.getRole(config.skyblockNews.discord.notifyRoleID)
						parts.push({ description: `-# ${role}` })
					}
					catch (e) {
						if (e instanceof DiscordInvalidRoleError) throw new DiscordInvalidRoleError({ roleID: config.skyblockNews.discord.notifyRoleID, roleName: 'Skyblock News Role', cause: e })
						else throw e
					}
				}

				const image = $('img').first().attr('src')

				parts.push(
					{
						color: key === 'skyblockAlphaNetwork' ? 'E7221B' : 'E7871B',
						embed: [
							{
								description: `## ${item.title}\n*${item.categories.map(c => c._)}*`
								// icon: key === 'skyblockAlphaNetwork' ? 'https://hypixelskyblock.minecraft.wiki/images/thumb/AlphaHypixelNetwork.png/300px-AlphaHypixelNetwork.png?3b297' : 'https://avatars.githubusercontent.com/u/3840546?s=280&v=4'
							},
							{
								images: image ?? undefined
							},
							{
								description: `${$('.bbWrapper').text().replace(/\n{2,}/g, '\n\n') }`
							}
						]
					},
					{
						buttons: [{ label: 'View Thread', url: item.link }]
					}
				)

				discord.send(discord.channels.SKYBLOCKNEWS, parts)
			}

		// TODO
		// Implement Minecraft side here
		// if (config.skyblockNews.minecraft.enabled)
		}

		if (newItems.length) {
			cache[key] = newItems[newItems.length - 1].isoDate
			cache.write()
		}
	}
}