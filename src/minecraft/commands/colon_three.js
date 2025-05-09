export default {
	name: ':3',
	prefix: false,
	channel: ['guild', 'officer', 'party', 'dm'],
	options: [],

	async execute(message) {
		await message.reply(':3');
	}
};
