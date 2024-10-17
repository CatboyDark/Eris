const { getMsg } = require('./logic/chat.js');
const { Collection } = require('discord.js');
const mineflayer = require('mineflayer');
const fs = require('fs');

class MC {
  constructor(client) {
    this.client = client;
    this.instance = {
      host: 'mc.hypixel.net',
      auth: 'microsoft',
      version: '1.8.9',
      viewDistance: 'tiny',
      chatLengthLimit: 256
    };
    this.bot = mineflayer.createBot(this.instance);
  }

  init() {
    this.initCmds();
    this.initFeatures();
    this.initLogic();
    this.initEvents();
  }

  initCmds() {
    this.commandList = new Collection();
    const commandFiles = fs.readdirSync('./src/minecraft/cmds').filter((file) => {
      return file.endsWith('.js');
    });

    for (const command of commandFiles) {
      const cmd = require(`./src/minecraft/cmds/${command}`);
      if (cmd.command) {
        this.commandList.set(cmd.command.toLowerCase(), cmd);
      }
    }

    this.bot.on('message', (message) => {
      const { chat, rank, guildRank, sender, content } = getMsg(message.toString());
      if (!content) {
        return;
      }
      const [commandName, ...args] = content.split(/ +/);
      const command = commandName.toLowerCase();

      if (this.commandList.has(command)) {
        const cmd = this.commandList.get(command);
        if (cmd.chat.includes(chat) || (chat === 'staff' && cmd.chat.includes('guild'))) {
          const msg = { chat, rank, guildRank, sender, content, args };
          cmd.execute(this.client, msg);
        }
      }
    });
  }

  initFeatures() {
    const featuresFiles = fs.readdirSync('./src/minecraft/features').filter((file) => {
      return file.endsWith('.js');
    });

    for (const featureFile of featuresFiles) {
      const feature = require(`./src/minecraft/features/${featureFile}`);
      if (typeof feature === 'function') {
        feature(this.bot, this.client);
      } else {
        console.error(`Feature at ./src/minecraft/features/${featureFile} is not a function.`);
      }
    }
  }

  initLogic() {
    this.Logic = {};
    const logicDir = './src/minecraft/logic';
    const logicFiles = fs.readdirSync(logicDir).filter((file) => {
      return file.endsWith('.js');
    });

    for (const file of logicFiles) {
      const logicModule = `./src/minecraft/logic/${file}`;
      if (typeof logicModule === 'object' && logicModule !== null) {
        Object.assign(this.Logic, logicModule);
      } else {
        this.Logic[file.replace('.js', '')] = logicModule;
      }
    }
  }

  initEvents() {
    this.bot.on('login', this.onLogin.bind(this));
    this.bot.on('kicked', this.onKick.bind(this));
    this.bot.on('error', this.onError.bind(this));
    this.bot.on('end', this.onEnd.bind(this));
  }

  onLogin() {
    const { server, _host } = this.bot._client.socket;
    console.log(`${this.instance.username} has joined ${server || _host}.`);
    this.bot.chat('/limbo');
  }

  onKick(reason) {
    console.log(`Kicked: ${reason}`);
    this.reconnect();
  }

  onError(error) {
    console.error(`Error: ${error.message}`);
  }

  onEnd() {
    console.log(`${this.instance.username} has disconnected.`);
    this.reconnect();
  }

  reconnect() {
    console.log('Attempting to reconnect in 10 seconds...');
    setTimeout(() => {
      this.bot = mineflayer.createBot(this.instance);
      this.bot.once('spawn', () => {
        console.log('Reconnected.');
        this.Logic.limbo(this.bot);
      });
    }, 10000);
  }
}

module.exports = MC;
