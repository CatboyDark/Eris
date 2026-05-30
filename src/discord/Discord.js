import { config, InternalError, UnknownError, UserError } from '#utils'
import { Client, Collection, GatewayIntentBits, PermissionFlagsBits, REST, Routes, SlashCommandBuilder } from 'discord.js'
import fs from 'fs'

export { Discord }
export let discord

let auth
try {
	auth = (await import('../../auth.json', { with: { type: 'json' } })).default
}
catch (e) {
	if (e.code === 'ERR_MODULE_NOT_FOUND') {
		throw new UserError({ message: 'Missing File | auth.json', desc: 'For more info, read https://github.com/CatboyDark/Eris.', cause: e, fatal: true })
	}
	else {
		throw new UnknownError({ cause: e })
	}
}

async function Discord() {
	discord = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent
		]
	})

	discord.plainCommands = new Collection()
	discord.slashCommands = new Collection()
	discord.buttons = new Collection()
	discord.menus = new Collection()
	discord.forms = new Collection()

	await slashCommands()
	await plainCommands()
	await buttons()
	await menus()
	await events()

	await discord.login(auth.discordToken)
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

		discord.slashCommands.set(slashCommand.data.name, slashCommand)
		commandList.push(slashCommand.data.toJSON())
	}

	if (auth.discordToken) {
		const rest = new REST({ version: '10' }).setToken(auth.discordToken)
		try {
			await rest.put(Routes.applicationCommands(Buffer.from(auth.discordToken.split('.')[0], 'base64').toString('ascii')), { body: commandList })
		}
		catch (e) {
			if (e.status === 401) throw new UserError({ cause: e, message: 'Invalid Discord Token', desc: 'For more info, read https://github.com/CatboyDark/Eris.', fatal: true })
			else throw new UnknownError({ cause: e })
		}
	}
	else {
		throw new UserError({ message: 'Missing Discord Token', desc: 'For more info, read https://github.com/CatboyDark/Eris.', fatal: true })
	}
}

function createSlash({ name, description, options = [], permissions = [], execute }) {
	const command = new SlashCommandBuilder().setName(name).setDescription(description)

	options.forEach((option) => {
		const { type, name, description, required, choices } = option

		switch (type) {
			case 'user':
				command.addUserOption((o) => o.setName(name).setDescription(description).setRequired(required ?? false))
				break
			case 'role':
				command.addRoleOption((o) => o.setName(name).setDescription(description).setRequired(required ?? false))
				break
			case 'channel':
				command.addChannelOption((o) => o.setName(name).setDescription(description).setRequired(required ?? false))
				break
			case 'string':
				command.addStringOption((o) => {
					o.setName(name).setDescription(description).setRequired(required ?? false)
					if (choices.length > 0) o.addChoices(...choices)
					return o
				})
				break
			case 'integer':
				command.addIntegerOption((o) => {
					o.setName(name).setDescription(description).setRequired(required ?? false)
					if (choices.length > 0) o.addChoices(...choices)
					return o
				})
				break
			default:
				throw new InternalError({ message: `Invalid Command Option | ${type}` })
		}
	})

	if (typeof permissions === 'number' && permissions === 0) {
		command.setDefaultMemberPermissions(BigInt(0))
	}
	else if (Array.isArray(permissions) && permissions.length > 0) {
		const permissionBits = permissions.reduce((acc, perm) => {
			const bit = PermissionFlagsBits[perm]
			if (!bit) throw new InternalError({ message: `Invalid Permission | ${perm}` })

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

		discord.plainCommands.set(command.prefix ? `${prefix}${command.name}` : command.name, command)
	}
}

async function buttons() {
	console.debug('Initializing buttons')
	const files = fs.readdirSync('./src/discord/buttons')
	for (const file of files) {
		const button = await import(`./buttons/${file}`)
		const buttonList = button.default || []
		for (const item of buttonList) {
			discord.buttons.set(item.id, item)
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
			discord.buttons.set(item.id, item)
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

		discord.on(event.name, (...args) => event.execute(...args))
	}
}