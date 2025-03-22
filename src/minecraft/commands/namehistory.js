export default {
	name: 'namehistory',
	prefix: true,
	aliases: ['nh'],
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['ign'],

	async execute(message) {
		if (!message.options.ign) return message.reply('Enter a player!');

		const response = await fetch(`https://laby.net/api/v3/user/${message.options.ign}/profile`);
		if (!response.ok) message.reply('Invalid player!');

		const data = await response.json();

		const igns = data.name_history.map(entry => entry.name).reverse();
		const uniqueIGNs = [...new Set(igns)];
		const currentIGN = uniqueIGNs[0];
		const uniqueIGNsFiltered = uniqueIGNs.filter(ign => ign !== currentIGN);

		if (uniqueIGNsFiltered.length === 0) {
			message.reply(`${currentIGN} has no aliases!`);
		}
		else {
			message.reply(`${currentIGN}'s aliases: ${uniqueIGNsFiltered.join(', ')}`);
		}
	}
};
