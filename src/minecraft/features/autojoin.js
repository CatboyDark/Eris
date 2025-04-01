import { discord } from '../../discord/Discord.js';
import { createMsg, getPlayer, getSBLevel, readConfig } from '../../helper.js';
import { minecraft } from '../Minecraft.js';

export default async () => {
	const config = readConfig();
	if (!config.guild.autoAccept.enabled) return;

	const logs = discord.channels.cache.get(config.logs.bot);

	minecraft.on('message', async (message) => {
		const msg = message.toString().trim();

		if (!msg.startsWith('-') || !msg.includes('Click here to accept or type /guild accept')) return;

		const match = msg.match(/\/guild accept (\w+)/);
		const ign = match[1];

		const player = await getPlayer(ign);
		const level = await getSBLevel.highest(player).catch((e) => {
			if (e.message.includes('The player has no skyblock profiles.')) {
				minecraft.chat(`/oc ${player} does not meet our reqs!`);
				logs.send({ embeds: [createMsg({ desc: `**${player} does not meet our reqs!**` })] });
				return;
			};
		});

		if (level >= config.guild.autoAccept.requirement) {
			minecraft.chat(`/oc ${player} meets our reqs!`);
			logs.send({ embeds: [createMsg({ desc: `**${player} meets our reqs! Accepted!**` })] });

			setTimeout(() => {
				minecraft.chat(`/g accept ${ign}`);
			}, 1000);

			setTimeout(() => {
				minecraft.chat(`/gc Welcome ${ign}! Be sure to join our discord! (/g discord)`);
			}, 2000);
		}
	});
};
