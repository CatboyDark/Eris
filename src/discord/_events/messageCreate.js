import { Events } from 'discord.js';

export default {
	name: Events.MessageCreate,

	async execute(message) {
		if (message.author.bot) return;

		await plainCommands(message);
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
