import { getNw, getPlayer } from '../../utils/utils.js';

export default {
	name: 'networth',
	prefix: true,
	aliases: ['nw'],
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['ign', 'profile'],

	async execute(message) {
		let player;

		if (!message.options.ign) {
			player = await getPlayer(message.sender);
		}
		else {
			player = await getPlayer(message.options.ign).catch((e) => {
				if (e.message.includes('Player does not exist.')) return message.reply('Invalid player!');
				if (e.message.includes('Player has never logged into Hypixel.')) return message.reply(`${message.options.ign} doesn't play Hypixel!`);
			});
		}

		if (!player) return;

		let nw;
		if (message.options.profile === '-h') {
			nw = await getNw.highest(player).catch((e) => {
				if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
			});
		}
		else {
			nw = await getNw.current(player).catch((e) => {
				if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
			});
		}

		if (!nw) return;

		message.reply(`${player.nickname}'s Networth: ${format(nw.networth)} | Purse: ${format(nw.purse)} | Bank: ${format(nw.bank)}`);
	}
};

function format(value) {
	if (value >= 1e12) return (Math.floor(value / 1e10) / 100).toFixed(2) + 'T';
	if (value >= 1e9) return (Math.floor(value / 1e8) / 10).toFixed(1) + 'B';
	if (value >= 1e6) return Math.floor(value / 1e6) + 'M';
	if (value >= 1e3) return Math.floor(value / 1e3) + 'k';
	return Math.floor(value.toString());
}
