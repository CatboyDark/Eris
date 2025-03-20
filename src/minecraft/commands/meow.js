export default {
	name: 'meow',
	prefix: false,
	channel: ['guild', 'officer', 'party', 'dm'],

	async execute(message) {
		const meows = [
			'meow',
			'mew',
			'mewww',
			'meeooow',
			'meowww',
			'meoow',
			'myaa',
			'nyah',
			'nyahhhhhhhhhhh~',
			'nyan',
			'mrah',
			'mewo'
		];

		const meow = meows[Math.floor(Math.random() * meows.length)];
		message.reply(meow);
	}
};
