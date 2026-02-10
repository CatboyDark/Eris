import fs from 'fs'
import { Client, Collection, GatewayIntentBits, PermissionFlagsBits, REST, Routes } from 'discord.js'
import auth from '../../auth.json' with { type: 'json' }
import { Config } from '#utils'

export { Discord }
export let discord

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

	await slashCommands()
	await plainCommands()
	await buttons()
	await menus()
	await events()

	await discord.login(auth.discordToken)
}

async function slashCommands() {
	const commandList = []

	const files = fs.readdirSync('./src/discord/commands/slash')
	for (const file of files) {
		const command = (await import(`./commands/slash/${file}`)).default
		if (!command) {
			console.yellow(`Invalid Slash Command | ${file.replace('.js', '')}`)
			continue
		}

		const slashCommand = createSlash(command)

		discord.slashCommands.set(slashCommand.data.name, slashCommand)
		commandList.push(slashCommand.data.toJSON())
	}

	const rest = new REST({ version: '10' }).setToken(auth.discordToken)
	await rest.put(Routes.applicationCommands(Buffer.from(auth.discordToken.split('.')[0], 'base64').toString('ascii')), { body: commandList })
}

function createSlash({ name, desc, options = [], permissions = [], execute }) {
	const command = new SlashCommandBuilder().setName(name).setDescription(desc)

	options.forEach((option) => {
		const { type, name, desc, required, choices } = option
		const isRequired = required === undefined ? false : required
		const hasChoices = choices || []

		switch (type) {
			case 'user':
				command.addUserOption((o) => o.setName(name).setDescription(desc).setRequired(isRequired))
				break
			case 'role':
				command.addRoleOption((o) => o.setName(name).setDescription(desc).setRequired(isRequired))
				break
			case 'channel':
				command.addChannelOption((o) => o.setName(name).setDescription(desc).setRequired(isRequired))
				break
			case 'string':
				command.addStringOption((o) => {
					o.setName(name).setDescription(desc).setRequired(isRequired)
					if (hasChoices.length > 0) o.addChoices(...hasChoices)
					return o
				})
				break
			case 'integer':
				command.addIntegerOption((o) => {
					o.setName(name).setDescription(desc).setRequired(isRequired)
					if (hasChoices.length > 0) o.addChoices(...hasChoices)
					return o
				})
				break
			default:
				throw new Error(`Invalid Command Option | ${type}`)
		}
	})

	if (typeof permissions === 'number' && permissions === 0) {
		command.setDefaultMemberPermissions(BigInt(0))
	}
	else if (Array.isArray(permissions) && permissions.length > 0) {
		const permissionBits = permissions.reduce((acc, perm) => {
			const bit = PermissionFlagsBits[perm]
			if (!bit) throw new Error(`Invalid Permission | ${perm}`)

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
	const prefix = Config.prefix

	const files = fs.readdirSync('./src/discord/commands/plain')
	for (const file of files) {
		const command = (await import(`./commands/plain/${file}`)).default
		if (!command) {
			console.yellow(`Invalid Plain Command | ${file.replace('.js', '')}`)
			continue
		}

		discord.plainCommands.set(command.prefix ? `${prefix}${command.name}` : command.name, command)
	}
}

async function buttons() {
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
	const files = fs.readdirSync('./src/discord/_events')
	for (const file of files) {
		const event = (await import(`./_events/${file}`)).default
		if (!event) {
			console.yellow(`Invalid Event | ${file.replace('.js', '')}`)
			continue
		}

		discord.on(event.name, (...args) => event.execute(...args))
	}
}