import { Client, Collection, GatewayIntentBits } from 'discord.js'

export { Discord }

class Discord {
	
	constructor(client: Client) {}

	async start(): Promise<Discord> {
		const client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent
			]
		})

		this.plainCommands = new Collection()
		this.slashCommands = new Collection()
		this.buttons = new Collection()
		this.menus = new Collection()
		this.forms = new Collection()

		const discord = new Discord(client)
		await discord.init()

		return discord
	}
	
	async init(): Promise<void> {
		await initSlashCommands()
		await initPlainCommands()
		await initButtons()
		await initMenus()
		await initEvents()

		await this.client.login(auth.discordBotToken)
	}
}
