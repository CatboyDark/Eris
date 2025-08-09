export default {
	name: 'dice',
	prefix: true,
	aliases: ['roll'],
	channels: ['guild', 'officer', 'party', 'dm'],
	options: ['sides'],

	async execute(message) {
		let sides = parseInt(message.options.sides) || 6;
		if (sides < 2) sides = 2;

		message.reply(`You rolled a ${Math.floor(Math.random() * sides) + 1}!`);
	}
};
