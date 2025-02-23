import { Events } from 'discord.js';

async function plainCommands(message) {
	const args = message.content.trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	if (message.client.pc.has(commandName)) {
		const command = message.client.pc.get(commandName);
		await command.execute(message, args);
	}
}

export default {
	name: Events.MessageCreate,

	async execute(message) {
		if (message.author.bot) return;

		await plainCommands(message);
	}
};
