import { DCsend, DiscordChannels } from '#utils'
import { Events } from 'discord.js'

let ready
export const discordReady = new Promise(r => { ready = r })

export default {
	name: Events.ClientReady,

	async execute(client) {
		console.info(`${client.user.username} is online!`)

		await DCsend(DiscordChannels.Bot, [{ embed: [{ desc: `**${client.user.username}** is online!` }] }])

		ready()
	}
}