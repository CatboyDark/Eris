import { config, ConfigInvalidIGNError, discord, DiscordEmojiError, MinecraftInvalidPlayerError, UnknownError } from '#utils'
import { Events } from 'discord.js'
import { hypixel } from '../../utils/minecraft.js'
import { schedule } from 'node-cron'
import fs from 'fs'
import { skyblockNews } from '../../modules/skyblockNews.js'

let ready
export const discordReady = new Promise(r => { ready = r })

export default {
	name: Events.ClientReady,

	async execute(client) {
		console.info(`${client.user.username} is online!`)

		await initEmojis(client)

		let guild
		if (config.ign) {
			try {
				guild = await hypixel.getGuild({ playerName: config.ign })
			}
			catch (e) {
				if (e instanceof MinecraftInvalidPlayerError) throw new ConfigInvalidIGNError({ ign: config.ign, cause: e })
				throw new UnknownError({ cause: e })
			}

			if (guild) {
				config.guildID = guild.id
				config.write()
			}
		}

		const discordServer = discord.getServer(config.serverID)
		// client.user.setActivity(guild.name ?? discordServer.name, { type: ActivityType.Watching })

		// This is necessary to get all members of every role
		await discordServer.members.fetch()

		ready()

		setInterval(async () => {
			await skyblockNews()
		}, 60 * 1000)

		schedule('0 0 * * *',
			async () => {
				// await logGXP()
				// await updateMembers()
				// await updateStatsChannels()
			},
			{
				timezone: 'America/Los_Angeles'
			}
		)
	}
}

async function initEmojis(client) {
	try {
		const app = await client.application.fetch()
		const emojis = await app.emojis.fetch()

		const emojiFiles = fs.readdirSync('./assets/emojis').filter((file) => file.endsWith('.png'))
		const map = new Map(emojis.map(emoji => [emoji.name, emoji]))

		for (const [name, emoji] of map) {
			if (!emojiFiles.includes(`${name}.png`)) {
				await emoji.delete()
			}
		}

		for (const emojiFile of emojiFiles) {
			const emojiName = emojiFile.split('.')[0]

			if (map.has(emojiName)) {
				const emoji = map.get(emojiName)
				await emoji.edit({ name: emojiName })
			}
			else {
				await app.emojis.create({ attachment: `./assets/emojis/${emojiFile}`, name: emojiName })
			}
		}
	}
	catch (e) {
		throw new DiscordEmojiError({ cause: e })
	}
}