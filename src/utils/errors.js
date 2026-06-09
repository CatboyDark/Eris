import { color, config } from '#utils'

function handleError(error) {
	if (error instanceof ErisError) {
		let output = ''

		if (error.description) {
			output += error.fatal ? color.red(error.description) : color.yellow(error.description)
		}

		if ((config.debug || error.unknown)) {
			output += error.description ? '\n' : ''

			if (error.cause) output += error.cause.stack
			else output += error.stack
		}

		if (error.fatal) {
			console.error(error.message, output)
			process.exit(1)
		}
		else {
			console.warn(error.message, output)
		}

		return
	}

	console.error('Unexpected Error!', error)
	process.exit(1)
}

process.on('uncaughtException', handleError)
process.on('unhandledRejection', handleError)

class ErisError extends Error {
	constructor({ message = '', description = '', cause = null, fatal = false }) {
		super(message, { cause })
		this.name = this.constructor.name
		this.description = description
		this.fatal = fatal

		Error.captureStackTrace(this, this.constructor)
	}
}

class UnknownError extends ErisError {
	constructor({ message = 'Unknown Error!', cause = null, fatal = false } = {}) {
		super({ message, cause, fatal })
		this.unknown = true
	}
}

class UnknownNetworkError extends ErisError {
	constructor(response) {
		super({ message: `Unknown Network Error | ${response.status} ${response.statusText}`, fatal: true })
		this.unknown = true
	}
}

class AuthMissingError extends ErisError {
	constructor() {
		super({ message: 'Missing File | auth.json', description: 'For more info, read https://github.com/CatboyDark/Eris.', fatal: true })
	}
}

class ConfigMissingError extends ErisError {
	constructor() {
		super({ message: 'Missing File | config.json', description: 'Please rename "exampleconfig.json" to "config.json".\nIf you fucked up already, you may grab a new one at https://github.com/CatboyDark/Eris. Pat pat :3' })
	}
}

class ConfigInvalidIGNError extends ErisError {
	constructor({ ign }) {
		super({ message: `Invalid IGN provided in config.json | ${ign}` })
	}
}

// Discord

// TODO TEST
class DiscordInvalidCommandOptionError extends ErisError {
	constructor({ optionType, commandName, optionName, cause }) {
		super({ message: `Invalid ${optionType} option for command ${commandName} | ${optionName}`, cause, fatal: true })
	}
}
class DiscordInvalidCommandPermissionError extends ErisError {
	constructor({ permission, commandName, cause }) {
		super({ message: `Invalid permission for cammand ${commandName} | ${permission}`, cause, fatal: true })
	}
}

class DiscordEmojiError extends ErisError {
	constructor({ cause }) {
		super({ message: 'Failed to initialize Discord emojis', cause, fatal: true })
	}
}

class DiscordMissingTokenError extends ErisError {
	constructor() {
		super({ message: 'Missing Discord Token', description: 'For more info, read https://github.com/CatboyDark/Eris.', fatal: true })
	}
}

class DiscordInvalidTokenError extends ErisError {
	constructor() {
		super({ message: 'Invalid Discord Token', description: 'For more info, read https://github.com/CatboyDark/Eris.', fatal: true })
	}
}

class DiscordMissingServerError extends ErisError {
	constructor() {
		super({ message: 'Missing Discord Server ID', description: 'For more info, read https://github.com/CatboyDark/Eris.', fatal: true })
	}
}

class DiscordInvalidServerError extends ErisError {
	constructor({ serverID, cause }) {
		let message
		if (!serverID) message = 'Missing Discord server ID'
		else message = `Invalid Discord server ID | ${serverID}`

		super({ message, description: 'For more info, read https://github.com/CatboyDark/Eris.', cause, fatal: true })
	}
}

class DiscordInvalidChannelError extends ErisError {
	constructor({ channelName, channelID, cause } = {}) {
		let message
		if (!channelID) message = `Missing Discord channel ID${channelName ? ` for ${channelName}` : ''}`
		else message = `Invalid Discord channel ID${channelName ? ` for ${channelName}` : ''} | ${channelID}`

		super({ message, cause, fatal: true })
	}
}

class DiscordInvalidRoleError extends ErisError {
	constructor({ roleID, roleName, cause } = {}) {
		let message
		if (!roleID) message = `Missing Discord role ID${roleName ? ` for ${roleName}` : ''}`
		else message = `Invalid Discord role ID${roleName ? ` for ${roleName}` : ''} | ${roleID}`
		super({ message, cause })
	}
}

class DiscordInvalidMemberError extends ErisError {
	constructor({ memberID, cause }) {
		super({ message: `Invalid Discord Member ID | ${memberID}`, cause })
	}
}

// Minecraft

class MinecraftInvalidArgsGetPlayerError extends ErisError {
	constructor() {
		super({ message: 'Invalid Minecraft getPlayer Arguments', description: 'Valid arguments: id, ign' })
	}
}

class MinecraftInvalidPlayerError extends ErisError {
	constructor({ ign, id, cause } = {}) {
		const context = ign ? `IGN: ${ign}` : `UUID: ${id}`
		super({ message: `Invalid Minecraft Player | ${context}`, cause })
	}
}

// Hypixel

class HypixelMissingAPIKeyError extends ErisError {
	constructor() {
		super({ message: 'Missing Hypixel API Key', description: 'For more info, read https://github.com/CatboyDark/Eris.', fatal: true })
	}
}

class HypixelInvalidAPIKeyError extends ErisError {
	constructor() {
		super({ message: 'Invalid Hypixel API Key', description: 'For more info, read https://github.com/CatboyDark/Eris.', fatal: true })
	}
}

class HypixelRateLimitError extends ErisError {
	constructor() {
		super({ message: 'Hypixel Rate Limit', description: 'Either the API rate limit has been exceeded OR the player has already been queried recently.' })
	}
}

class HypixelInvalidArgsGetGuildError extends ErisError {
	constructor() {
		super({ message: 'Invalid Hypixel getGuild Arguments', description: 'Valid arguments: guildID, guildName, playerID, playerName' })
	}
}

class HypixelInvalidGuildError extends ErisError {
	constructor({ guildName, guildID } = {}) {
		const context = guildName ? `Guild Name: ${guildName}` : `Guild ID: ${guildID}`
		super({ message: `Invalid Hypixel Guild | ${context}` })
	}
}

class HypixelInvalidArgsGetSkyblockError extends ErisError {
	constructor() {
		super({ message: 'Invalid Hypixel getSkyblock Arguments', description: 'Valid arguments: id, ign, networth' })
	}
}

class HypixelMissingSkyblockDataError extends ErisError {
	constructor({ ign, id } = {}) {
		const context = ign ? `IGN: ${ign}` : `UUID: ${id}`
		super({ message: `Missing Skyblock Data | ${context}` })
	}
}

export {
	UnknownError,
	UnknownNetworkError,

	AuthMissingError,
	ConfigMissingError,
	ConfigInvalidIGNError,

	DiscordInvalidCommandOptionError,
	DiscordInvalidCommandPermissionError,
	DiscordEmojiError,
	DiscordMissingTokenError,
	DiscordInvalidTokenError,
	DiscordMissingServerError,
	DiscordInvalidServerError,
	DiscordInvalidChannelError,
	DiscordInvalidRoleError,
	DiscordInvalidMemberError,

	MinecraftInvalidArgsGetPlayerError,
	MinecraftInvalidPlayerError,

	HypixelMissingAPIKeyError,
	HypixelInvalidAPIKeyError,
	HypixelRateLimitError,
	HypixelInvalidArgsGetGuildError,
	HypixelInvalidGuildError,
	HypixelInvalidArgsGetSkyblockError,
	HypixelMissingSkyblockDataError
}