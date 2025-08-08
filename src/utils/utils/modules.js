import { config } from './../utils.js';
import { meow } from '../../modules/meow.js';
import { colon_three } from '../../modules/colon_three.js';
import { minecraft } from '../../minecraft/Minecraft.js';

export { loadFunny };

const loadFunny = {
	async discord(message) {
		if (config.funny.meow) await meow.discord(message);
		if (config.funny.colon_three) await colon_three.discord(message);
	},

	async minecraft(message) {
		if (!message.channel || message.sender === minecraft.username || message.event) return;

		if (config.funny.meow) await meow.minecraft(message);
		if (config.funny.colon_three) await colon_three.minecraft(message);
	}
};
