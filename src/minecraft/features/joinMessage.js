import { readConfig } from '../../helper.js';
import { minecraft } from '../Minecraft.js';

const config = readConfig();

export default async () => {
	if (!config.guild.joinMessage.enabled) return;

	minecraft.on('message', async (message) => {
		const msg = message.toString().trim();

		const match = msg.match(/^(?:\[[^\]]+\] )?(\w+) joined the guild!$/);
		if (!match) return;

		const ign = match[1];
		setTimeout(() => {
			minecraft.chat(config.guild.joinMessage.message.replace('@ign', ign) ?? `/gc Welcome ${ign}!`);
		}, 5000);
	});
};
