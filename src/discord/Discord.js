import { config, DiscordInvalidCommandOptionError, DiscordInvalidCommandPermissionError, DiscordInvalidTokenError, DiscordMissingTokenError, UnknownError, discord, read } from '#utils'
import { Client, Collection, GatewayIntentBits, PermissionFlagsBits, REST, Routes, SlashCommandBuilder } from 'discord.js'
import fs from 'fs'

export { Discord }

const auth = read('auth.json')

async function Discord() {
	const bot = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent
		]
	})

	discord.bot = bot

	bot.plainCommands = new Collection()
	bot.slashCommands = new Collection()
	bot.buttons = new Collection()
	bot.menus = new Collection()
	bot.forms = new Collection()

	await slashCommands()
	await plainCommands()
	await buttons()
	await menus()
	await events()

	await bot.login(auth.discordBotToken)
}

async function slashCommands() {
	console.debug('Initializing slash commands')
	const commandList = []

	const files = fs.readdirSync('./src/discord/slashCommands')
	for (const file of files) {
		const command = (await import(`./slashCommands/${file}`)).default
		if (!command) {
			console.warn(`Invalid Slash Command | ${file.replace('.js', '')}`)
			continue
		}

		const slashCommand = createSlash(command)

		discord.bot.slashCommands.set(slashCommand.data.name, slashCommand)
		commandList.push(slashCommand.data.toJSON())
	}

	if (auth.discordBotToken) {
		const rest = new REST({ version: '10' }).setToken(auth.discordBotToken)
		try {
			await rest.put(Routes.applicationCommands(Buffer.from(auth.discordBotToken.split('.')[0], 'base64').toString('ascii')), { body: commandList })
		}
		catch (e) {
			if (e.status === 401) throw new DiscordInvalidTokenError()
			else throw new UnknownError({ cause: e })
		}
	}
	else {
		throw new DiscordMissingTokenError()
	}
}

function createSlash({ name, description, options = [], permissions = [], execute }) {
	const command = new SlashCommandBuilder().setName(name).setDescription(description)

	options.forEach((option) => {
		const { type, optionName, optionDescription, required, choices } = option

		switch (type) {
			case 'user':
				command.addUserOption((o) => o.setName(optionName).setDescription(optionDescription).setRequired(required ?? false))
				break
			case 'role':
				command.addRoleOption((o) => o.setName(optionName).setDescription(optionDescription).setRequired(required ?? false))
				break
			case 'channel':
				command.addChannelOption((o) => o.setName(optionName).setDescription(optionDescription).setRequired(required ?? false))
				break
			case 'string':
				command.addStringOption((o) => {
					o.setName(optionName).setDescription(optionDescription).setRequired(required ?? false)
					if (choices.length > 0) o.addChoices(...choices)
					return o
				})
				break
			case 'integer':
				command.addIntegerOption((o) => {
					o.setName(optionName).setDescription(optionDescription).setRequired(required ?? false)
					if (choices.length > 0) o.addChoices(...choices)
					return o
				})
				break
			default:
				throw new DiscordInvalidCommandOptionError({ optionType: type, commandName: name, optionName })
		}
	})

	if (typeof permissions === 'number' && permissions === 0) {
		command.setDefaultMemberPermissions(BigInt(0))
	}
	else if (Array.isArray(permissions) && permissions.length > 0) {
		const permissionBits = permissions.reduce((acc, perm) => {
			const bit = PermissionFlagsBits[perm]
			if (!bit) throw new DiscordInvalidCommandPermissionError({ permission: perm, commandName: name })

			return acc | BigInt(bit)
		}, BigInt(0))

		command.setDefaultMemberPermissions(permissionBits)
	}

	return {
		data: command,
		execute
	}
}

async function plainCommands() {
	console.debug('Initializing plain commands')
	const prefix = config.prefix

	const files = fs.readdirSync('./src/discord/plainCommands')
	for (const file of files) {
		const command = (await import(`./plainCommands/${file}`)).default
		if (!command) {
			console.warn(`Invalid Plain Command | ${file.replace('.js', '')}`)
			continue
		}

		discord.bot.plainCommands.set(command.prefix ? `${prefix}${command.name}` : command.name, command)
	}
}

async function buttons() {
	console.debug('Initializing buttons')
	const files = fs.readdirSync('./src/discord/buttons')
	for (const file of files) {
		const button = await import(`./buttons/${file}`)
		const buttonList = button.default || []
		for (const item of buttonList) {
			discord.bot.buttons.set(item.id, item)
		}
	}
}

async function menus() {
	console.debug('Initializing menus')
	const files = fs.readdirSync('./src/discord/menus')
	for (const file of files) {
		const menu = await import(`./buttons/${file}`)
		const menuList = menu.default || []
		for (const item of menuList) {
			discord.bot.buttons.set(item.id, item)
		}
	}
}

async function events() {
	console.debug('Initializing events')
	const files = fs.readdirSync('./src/discord/events')
	for (const file of files) {
		const event = (await import(`./events/${file}`)).default
		if (!event) {
			console.warn(`Invalid Event | ${file.replace('.js', '')}`)
			continue
		}

		discord.bot.on(event.name, (...args) => event.execute(...args))
	}
}