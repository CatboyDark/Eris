import fs from 'fs';

const meows = JSON.parse(fs.readFileSync('./assets/meow.json', 'utf8'));

const commands = meows.map((meow) => ({
	name: meow,
	prefix: false,
	channel: ['guild', 'officer', 'party', 'dm'],

	async execute(message) {
		const meowList = meows.filter((item) => item !== meow);
		const randomMeow = meowList[Math.floor(Math.random() * meowList.length)];
		message.reply(randomMeow);
	}
}));

export default commands;
