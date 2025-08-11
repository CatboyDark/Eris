import fs from 'fs';

export { meow };

const meows = JSON.parse(fs.readFileSync('./assets/meow.json', 'utf8'));
const escapedMeows = meows.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const meowRegex = new RegExp(`\\b(?:${escapedMeows.join('|')})\\b`, 'i');

const meow = {
	async discord(message) {
		if (meowRegex.test(message.content)) {
			const randomMeow = meows[Math.floor(Math.random() * meows.length)];
			return message.channel.send(`${randomMeow}`);
		}
	},

	async minecraft(message) {
		if (meowRegex.test(message.content)) {
			const randomMeow = meows[Math.floor(Math.random() * meows.length)];
			message.reply(randomMeow);
		}
	}
};
