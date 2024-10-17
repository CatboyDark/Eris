const { Client, Collection, GatewayIntentBits, REST, Routes, ActivityType } = require('discord.js');
const { createMsg, createSlash } = require('../helper/builder.js');
const { readConfig } = require('../helper/utils.js');
const { token } = require('../../config.json');
const fs = require('fs');

class DiscordManager {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ]
    });

    this.client.plainCommands = new Collection();
    this.client.slashCommands = new Collection();
  }

  async init() {
    await this.initCmds();
    this.initEvents();
    await this.initEmojis();
    this.login();
  }

  async initCmds() {
    const slashCommandFiles = fs.readdirSync('./src/discord/cmds/slash').filter((file) => {
      return file.endsWith('.js');
    });
    if (slashCommandFiles.length === 0) throw new Error('Slash Commands are missing');
    const slashCommands = [];
    slashCommandFiles.forEach((slashCommandPath) => {
      const slashCommand = require(slashCommandPath);
      const slashCmd = createSlash(slashCommand);
      this.client.slashCommands.set(slashCmd.data.name, slashCmd);
      slashCommands.push(slashCmd.data.toJSON());
    });

    const rest = new REST({ version: '10' }).setToken(token);
    await rest.put(Routes.applicationCommands(Buffer.from(token.split('.')[0], 'base64').toString('ascii')), {
      body: slashCommands
    });

    const plainCommandFiles = fs.readdirSync('./src/discord/cmds/plain').filter((file) => {
      return file.endsWith('.js');
    });
    if (plainCommandFiles.length === 0) throw new Error('Plain Commands are missing');
    plainCommandFiles.forEach((plainCommandPath) => {
      const cmdData = require(plainCommandPath);
      this.client.plainCommands.set(cmdData.name, cmdData);
    });

    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      const args = message.content.trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      if (this.client.plainCommands.has(commandName)) {
        const command = this.client.plainCommands.get(commandName);
        await command.execute(message, args);
      }
    });
  }

  initEvents() {
    const eventFiles = fs.readdirSync('./src/discord/events').filter((file) => {
      return file.endsWith('.js');
    });
    if (eventFiles.length === 0) throw new Error('Events are missing');
    eventFiles.forEach((eventPath) => {
      const event = require(eventPath);
      this.client.on(event.name, (...args) => {
        return event.execute(...args);
      });
    });
  }

  async initEmojis() {
    const application = await this.client.application.fetch();
    const currentEmojis = await application.emojis.fetch();
    const emojiFiles = fs.readdirSync('./assets/emojis').filter((file) => {
      return file.endsWith('.png');
    });
    if (emojiFiles.length === 0) throw new Error('Emojis are missing');
    emojiFiles.forEach((emoji) => {
      if (currentEmojis.has(emoji.split('.')[0])) return;
      application.emojis
        .create({ attachment: `./assets/emojis/${emoji}`, name: emoji.split('.')[0] })
        .then((emoji) => {
          return console.log(`Uploaded ${emoji.name} Emoji`);
        })
        .catch(console.error);
    });
  }

  login() {
    this.client.login(token);
    const config = readConfig();

    this.client.on('ready', () => {
      if (config.logsChannel) {
        const channel = this.client.channels.cache.get(config.logsChannel);
        channel.send({ embeds: [createMsg({ desc: '**Discord is Online!**' })] });
      }
      if (config.guild) {
        this.client.user.setActivity(config.guild, { type: ActivityType.Watching });
      }
      console.log('Discord is online!');
    });
  }
}

module.exports = DiscordManager;
