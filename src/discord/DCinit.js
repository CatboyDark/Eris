import { Client, Partials, Collection, GatewayIntentBits, REST, Routes, ActivityType } from 'discord.js';
import { createMsg, createSlash } from '../helper/builder.js';
import { readConfig } from '../helper/utils.js';
import { token, consoleChannels } from '../../config.json';
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
        await this.initEmojis();
        this.initEvents();
        this.login();
    }

    async initCmds() // Credit: Kathund
    {
        const slashDir = fs.readdirSync('./src/discord/cmds/slash').filter((file) => { return file.endsWith('.js'); });
        const slashCommands = [];
        slashDir.forEach((slashFile) =>
        {
            const slashCommand = require(slashFile);
            const slashCmd = createSlash(slashCommand);
            this.client.sc.set(slashCmd.data.name, slashCmd);
            slashCommands.push(slashCmd.data.toJSON());
        });

        const rest = new REST({ version: '10' }).setToken(token);
        await rest.put(Routes.applicationCommands(Buffer.from(token.split('.')[0], 'base64').toString('ascii')), { body: slashCommands });

        const plainDir = fs.readdirSync('./src/discord/cmds/plain').filter((file) => { return file.endsWith('.js'); });
        plainDir.forEach((plainFile) =>
        {
            const cmdData = require(plainFile);
            this.client.plainCommands.set(cmdData.name, cmdData);
        });

        this.client.on('messageCreate', async(message) =>
        {
            if (message.author.bot) return;
            const args = message.content.trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            if (this.client.plainCommands.has(commandName))
            {
                const command = this.client.plainCommands.get(commandName);
                await command.execute(message, args);
            }
        });
    }

    async initEvents() // Credit: Kathund
    {
        const eFiles = fs.readdirSync('./src/discord/events').filter((file) => { return file.endsWith('.js'); });
        eFiles.forEach((ePath) => 
        {
            const event = require(ePath);
            this.client.on(event.name, (...args) => 
            { 
                return event.execute(...args);
            });
        });
    }

    async initEmojis() // Credit: Kathund
    {
        const application = await this.client.application.fetch();

        const existingEmojis = await response.json();
        this.client.emojiMap = new Map(
            existingEmojis.items.map((emoji) => [emoji.name, emoji.id])
        );
        const currentEmojis = await application.emojis.fetch();
        const emojiFiles = fs.readdirSync('./assets/emojis').filter((file) => 
        {
            return file.endsWith('.png');
        });
        if (emojiFiles.length === 0) throw new Error('Emojis are missing');
    emojiFiles.forEach((emoji) => 
{
      if (currentEmojis.has(emoji.split('.')[0])) return;
      application.emojis
        .create({ attachment: `./assets/emojis/${emoji}`, name: emoji.split('.')[0] })
        .then((emoji) => 
{
          return console.log(`Uploaded ${emoji.name}`);
        })
        .catch(console.error);
    });

    }

    login()
    {
        this.client.login(token);
        const config = readConfig();

        this.client.on('ready', () =>
        {
            if (config.logsChannel)
            {
                const channel = this.client.channels.cache.get(
                    config.logsChannel
                );
                channel.send({
                    embeds: [createMsg({ desc: '**Discord is Online!**' })]
                });
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

module.exports = DC;
