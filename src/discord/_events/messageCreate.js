import { Events } from 'discord.js';
import { loadFunny } from '../../utils/utils.js';
import { DCbridge } from '../../modules/bridge.js';
import { fakeBridgeCommands } from '../../modules/bridgeCommands.js';
// import { DCserver } from './clientReady.js';

export default {
	name: Events.MessageCreate,

	async execute(message) {
		if (message.author.bot) return;

		await plainCommands(message);
		await loadFunny.discord(message);

		await DCbridge(message);
		await fakeBridgeCommands(message);
	}
};

async function plainCommands(message) {
	const args = message.content.trim().split(' ');
	const commandName = args.shift().toLowerCase();

	if (message.client.plainCommands.has(commandName)) {
		const command = message.client.plainCommands.get(commandName);
		return await command.execute(message, args);
	}
}
