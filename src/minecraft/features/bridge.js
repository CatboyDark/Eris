import { readConfig } from '../../helper/utils.js';

const ignore = 
[
	'/limbo for more information.',
	'The lobby you attempted to join was full or offline.',
	'Because of this, you were routed to Limbo, a subset of your own imagination.',
	'This place doesn\'t exist anywhere, and you can stay here as long as you\'d like.',
	'To return to "reality", use /lobby GAME.',
	'Examples: /lobby, /lobby skywars, /lobby arcade',
	'Watch out, though, as there are things that live in Limbo.'
];
 
export default (bot, client) => {
	const config = readConfig();

	// Ingame -> Discord
	bot.on('message', (message) => {
		if (!config.features.bridgeToggle) return;

		const content = message.toString().trim();
		const isIgnored = ignore.some((ignored) => content.startsWith(ignored));
		if (content.length < 1 || isIgnored) return;

		const fContent = content
			.replace(/<@/g, '<@\u200B')
			.replace(/<#/g, '<#\u200B')
			.replace(/<:/g, '<:\u200B')
			.replace(/<a/g, '<a\u200B')
			.replace(/@everyone/g, '@ everyone')
			.replace(/@here/g, '@ here');

		const channel = client.channels.cache.get(config.features.bridgeChannel);
		channel.send(`${fContent}`);
	});

	// Discord -> Ingame
	client.on('messageCreate', (message) => {
		if (!config.features.bridgeToggle) return;

		const channel = client.channels.cache.get(config.features.bridgeChannel);
		if (message.channel.id === channel?.id) {
			const content = message.content;
			if (message.author.bot) return;

			bot.chat(content);
		}
	});
};
