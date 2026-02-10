import { Config, DCsend, getChannel, getServer } from '#utils'
import { Events, PermissionFlagsBits } from 'discord.js'

let resolve
export const DiscordReady = new Promise((r) => { resolve = r })

export default {
	name: Events.ClientReady,

	async execute(client) {
		console.cyan(`${client.user.username} is online!`)

		if (!getChannel(Config.logs.bot.channelID)) createLogsChannel()
		// what is logs channel exists but console and bot logs doesnt?

		DCsend(Config.logs.bot.channelID, [{ embed: [{ desc: `**${client.user.username}** is online!` }]} ])

	}
}

async function createLogsChannel() {
	const validServer = getServer(Config.serverID)
	if (validServer) {
		try {
			await validServer.channels.create({
				name: 'logs',
				type: 0,
				permissionOverwrites: [
					{
						id: guild.roles.everyone.id,
						deny: PermissionFlagsBits.ViewChannel
					}
				]
			})
			Config.logs.channelID = channel.id
			Config.write()
		}
		catch (e) {
			console.error('createLogsChannel', e)
		}
	}
}