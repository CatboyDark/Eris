import { minecraft } from '../Minecraft.js';

export default async () => {
	if (!config.guild.joinMessage.enabled) return;

	minecraft.on('message', async (message) => {
		const msg = message.toString().trim();

		const match = msg.match(/^(?:\[[^\]]+\] )?(\w+) joined the guild!$/);
		if (!match) return;

		const ign = match[1];
		setTimeout(() => {
			minecraft.chat(`/gc Welcome ${ign}! Be sure to join our discord! (/g discord)`);
		}, 5000);
	});
};
