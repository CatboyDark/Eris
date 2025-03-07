import { discord } from '../../discord/Discord.js';
import display from '../../display.js';
import { createMsg, readConfig } from '../../helper.js';
import { Minecraft, minecraft } from '../Minecraft.js';

export default async () => {
	const config = readConfig();
	const logs = discord.channels.cache.get(config.logs.bot);

	minecraft.on('login', () => {
		const { server, _host } = minecraft._client.socket;
		display.c(`${config.ign} has joined ${server || _host}.`);
		logs.send({ embeds: [createMsg({ desc: `**${config.ign}** has joined **${server || _host}**.` })] });

		minecraft.chat('/limbo');
	});

	minecraft.on('kicked', (reason) => {
		display.y(`Kicked: ${reason}`);
		reconnect();
	});

	minecraft.on('end', () => {
		display.y(`${config.ign} has disconnected.`);
		reconnect();
	});

	minecraft.on('error', (error) => {
		display.r(`Error: ${error.message}`);
	});

	function reconnect() {
		display.y('Attempting to reconnect...');
		setTimeout(Minecraft, 5000);
	}
};
