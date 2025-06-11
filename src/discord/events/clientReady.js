import { Events } from 'discord.js';
import { config, display, saveConfig, getChannel, createMsg } from '../../utils/utils.js';

export default {
	name: Events.ClientReady,

	async execute(client) {
		await createLogsChannel(client);

		console.dir(createMsg([{ desc: 'abracadabra' }]), { depth: 5 });
		// getChannel(config.logs.bot.channel).send(createMsg([{ desc: 'abracadabra' }]));
	}
};

async function createLogsChannel(client) {
	if (!config.logs.channel) {
		if (client.guilds.cache.size > 1) {
			return display.r('ERROR: The bot is in multiple Discord servers. Please specify a logs channel in the config.');
		}
		else if (client.guilds.cache.size === 1) {
			const guild = client.guilds.cache.first();
			const channel = await guild.channels.create({
				name: 'logs',
				type: 0,
				permissionOverwrites: [
					{
						id: guild.roles.everyone.id,
						deny: ['ViewChannel']
					}
				]
			});
			config.logs.channel = channel.id;
			saveConfig();
		}
	}

	const logsChannel = getChannel(config.logs.channel);
	if (!logsChannel.threads.cache.find(x => x.name === 'Bot')) {
		const channel = await logsChannel.threads.create({ name: 'Bot' });
		config.logs.bot.channel = channel.id;
		saveConfig();
	}
	if (config.logs.console.enabled && !logsChannel.threads.cache.find(x => x.name === 'Console')) {
		const channel = await logsChannel.threads.create({ name: 'Console' });
		config.logs.console.channel = channel.id;
		saveConfig();
	}
}
