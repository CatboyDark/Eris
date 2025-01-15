import { Client, Partials, Collection, GatewayIntentBits, REST, Routes, ActivityType } from 'discord.js';
import { createMsg, createSlash } from '../helper/builder.js';
import config from '../../config.json' with { type: 'json' };
import fs from 'fs';

class DC
{
	constructor()
	{
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildPresences,
				GatewayIntentBits.GuildScheduledEvents
			],
			partials: [
				Partials.Message,
				Partials.Channel,
				Partials.GuildMember,
				Partials.User
			]
		});

		this.client.pc = new Collection();
		this.client.sc = new Collection();
	}

	async init()
	{
		await this.initCmds();
		// await this.initEmojis();
		this.initEvents();
		this.login();
	}

	async initCmds() // Credit: Kathund
	{
		console.log('Loading slash commands...');

		const slashDir = fs.readdirSync('./src/discord/cmds/slash').filter(file => file.endsWith('.js'));
		const slashCommands = [];
		for (const slashFile of slashDir)
		{
			console.log(`Importing slash command: ${slashFile}`);
			
			const slashCommand = (await import(`./cmds/slash/${slashFile}`)).default;
			const slashCmd = createSlash(slashCommand);
			this.client.sc.set(slashCmd.data.name, slashCmd);
			slashCommands.push(slashCmd.data.toJSON());
		};

		console.log(`${slashCommands.length} slash commands loaded.`);

		const rest = new REST({ version: '10' }).setToken(config.token);
		
 		console.log('Registering slash commands with Discord API...');
        await rest.put(Routes.applicationCommands(Buffer.from(config.token.split('.')[0], 'base64').toString('ascii')), { body: slashCommands });
        console.log('Slash commands successfully registered.');

		const plainDir = fs.readdirSync('./src/discord/cmds/plain').filter(file => file.endsWith('.js'));
		for (const plainFile of plainDir)
		{
			const cmdData = await import(`./cmds/plain/${plainFile}`);
			this.client.pc.set(cmdData.name, cmdData);
		};

		this.client.on('messageCreate', async(message) =>
		{
			if (message.author.bot) return;
			const args = message.content.trim().split(/ +/);
			const commandName = args.shift().toLowerCase();

			if (this.client.pc.has(commandName))
			{
				const command = this.client.pc.get(commandName);
				await command.execute(message, args);
			}
		});
	}

	async initEvents() // Credit: Kathund
	{
		const eventDir = fs.readdirSync('./src/discord/events').filter(file => file.endsWith('.js'));
		for (const eventFile of eventDir)
		{
			const event = await import(`./events/${eventFile}`);
			this.client.on(event.name, (...args) => 
			{ 
				return event.execute(...args);
			});
		};
	}

	// async initEmojis() // Credit: Kathund
	// {
	// 	const application = await this.client.application.fetch();
	// 	const currentEmojis = await application.emojis.fetch();
	// 	const emojiFiles = fs.readdirSync('./assets/emojis').filter((file) => file.endsWith('.png'));
	// 	emojiFiles.forEach((emoji) => 
	// 	{
	// 	if (currentEmojis.has(emoji.split('.')[0])) return;
	// 	application.emojis
	// 		.create({ attachment: `./assets/emojis/${emoji}`, name: emoji.split('.')[0] })
	// 		.then((emoji) => 
	// 		{ 
	// 			return console.log(`Uploaded ${emoji.name}`); 
	// 		})
	// 		.catch(console.error);
	// 	});
	// }

	login()
	{
		this.client.login(config.token);

		this.client.on('ready', () =>
		{
			if (config.logsChannel)
			{
				const channel = this.client.channels.cache.get(config.logsChannel);
				channel.send({ embeds: [createMsg({ desc: '**Discord is Online!**' })] });
			}
			if (config.guild)
			{
				this.client.user.setActivity(config.guild, {
					type: ActivityType.Watching
				});
			}
			console.log('Discord is online!');
		});
	}
}

export default DC;
