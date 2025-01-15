import DC from './src/discord/DCinit.js';
import MC from './src/minecraft/MCinit.js';
import Mongo from './src/mongo/mongoInit.js';

class Instance 
{
	constructor()
	{
		this.discord = new DC();
		this.minecraft = new MC(this.discord.client);
	}

	async start() 
	{
		await Mongo();
		await this.discord.init();
		await this.minecraft.init();
	}
}

const instance = new Instance();

instance.start();
