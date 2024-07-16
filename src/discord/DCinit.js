const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { clientID, logsChannel } = require('../../config.json');
const { createMsg } = require('../builder.js');

class DCinit
{
	constructor(token)
	{
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildMembers
			]
		});

		this.token = token;

		this.client.pc = new Collection();
		this.client.sc = new Collection();

		this.initCmds();
		this.initEvents();
		this.initFeatures();

		this.deploy();
		this.login();
	}

	async initCmds()
	{
		const cDir = path.join(__dirname, 'cmds');
		const cFiles = fs.readdirSync(cDir);

		for (const c of cFiles) 
		{
			const cp = path.join(cDir, c);
			const cf = fs.readdirSync(cp).filter((file) => file.endsWith('.js'));
			for (const f of cf) 
			{
				const fp = path.join(cp, f);
				const cmd = require(fp);

				if (cmd.type === 'plain') { this.client.pc.set(cmd.name, cmd); }
				if (cmd.type === 'slash') { this.client.sc.set(cmd.data.name, cmd); }
			}
		}

		this.client.on('message', async (message) => 
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

	initEvents()
	{
		const eDir = path.join(__dirname, 'events');
		const eFiles = fs.readdirSync(eDir).filter(file => file.endsWith('.js'));

		for (const e of eFiles) 
		{
			const ep = path.join(eDir, e);
			const event = require(ep);
			if (event.once)
			{ this.client.once(event.name, (...args) => event.execute(...args)); }
			else { this.client.on(event.name, (...args) => event.execute(...args)); }
		}
	}

	initFeatures()
	{
		const fDir = path.join(__dirname, 'features');
		const fFiles = fs.readdirSync(fDir).filter((file) => file.endsWith('.js'));

		for (const f of fFiles) 
		{
			const fp = path.join(fDir, f);
			const feature = require(fp);
			feature(this.client);
		}
	}

	async deploy()
	{
		const foldersPath = path.join(__dirname, 'cmds');
		const commands = this.collectCommands(foldersPath);

		const rest = new REST({ version: '10' }).setToken(this.token);
		await rest.put(Routes.applicationCommands(clientID), { body: commands });
	}

	readCommandFile(filePath)
	{
		const command = require(filePath);
		if (command.data && command.execute) { return command.data.toJSON(); }
		else {
			console.warn(`[WARNING] The command at ${filePath} is incomplete!`);
			return null;
		}
	}

	collectCommands(commandsPath)
	{
		const commandsPathSlash = path.join(commandsPath, 'slash');
		const commandFiles = fs.readdirSync(commandsPathSlash).filter(file => file.endsWith('.js'));

		return commandFiles.flatMap(file =>
		{
			const filePath = path.join(commandsPathSlash, file);
			return this.readCommandFile(filePath);
		}).filter(Boolean);
	}

	login()
	{
		this.client.login(this.token);

		this.client.on('ready', () => 
		{
			const embed = createMsg({
				description: '**Discord is Online!**'
			});

			const channel = this.client.channels.cache.get(logsChannel);
			channel.send({ embeds: [embed] });
			console.log('Discord is online!');
		});
	}
}

module.exports = DCinit;
