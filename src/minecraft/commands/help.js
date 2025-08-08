export default {
	name: 'help',
	prefix: true,
	channels: ['guild', 'officer', 'party', 'dm'],

	async execute(message) {
		message.reply('To see my commands, run /help on discord :3');
	}
};
