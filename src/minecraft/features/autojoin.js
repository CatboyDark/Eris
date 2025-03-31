import { discord } from '../../discord/Discord.js';
import { createMsg, getPlayer, getSBLevel, readConfig } from '../../helper.js';
import { minecraft } from '../Minecraft.js';

export default async () => {
	const config = readConfig();
	const logs = discord.channels.cache.get(config.logs.bot);

	minecraft.on('message', async (message) => {
		const msg = message.toString().trim();
		console.log(msg);

		if (!msg.startsWith('Click here to accept or type /guild accept')) return;
		console.log('a');

		const match = msg.match(/^Click here to accept or type \/guild accept (\w+)!$/);
		if (!match) {
			console.log('Regex did not match message:', msg);
			return;
		}
		const ign = match[1];
		console.log(ign);

		const player = await getPlayer(ign);
		const level = await getSBLevel.highest(player).catch((e) => {
			if (e.message.includes('The player has no skyblock profiles.')) {
				minecraft.chat(`/oc ${player} does not meet our reqs!`);
				logs.send({ embeds: [createMsg({ desc: `${player} does not meet our reqs!` })] });
				return;
			};
		});
		console.log(`${config.guild.autoAccept.requirement} : ${level}`);

		if (config.guild.autoAccept.enabled && level >= config.guild.autoAccept.requirement) {
			minecraft.chat(`/oc ${player} meets our reqs!`);

			setTimeout(() => {
				minecraft.chat(`/g accept ${ign}`);
			}, 500);

			setTimeout(() => {
				minecraft.chat(`/gc Welcome ${ign}! Remember to join our discord! (/g discord)`);
			}, 1000);
		}
	});
};
