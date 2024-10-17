const DiscordManager = require('./src/discord/DiscordManager');
const Mongo = require('./src/mongo/mongoInit');
const MC = require('./src/minecraft/MCinit');

class Instance {
  constructor() {
    this.discord = new DiscordManager();
    this.minecraft = new MC(this.discord.client);
  }

  async start() {
    await Mongo();
    await this.discord.init();
    await this.minecraft.init();
  }
}

const instance = new Instance();
instance.start();
