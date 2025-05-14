import { getSlayers, getPlayer } from '../../utils/utils.js';

export default {
	name: 'slayers',
	prefix: true,
	aliases: ['slayer'],
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

		let slayers;
		if (message.options.profile === '-h') {
			slayers = await getSlayers.highest(player).catch((e) => {
				if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
				console.log(e);
			});
		}
		else {
			slayers = await getSlayers.current(player).catch((e) => {
				if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
				console.log(e);
			});
		}

		await message.reply(`${player.nickname}'s Slayers: Zombie ${slayers.zombies.level} (${format(slayers.zombies.xp)}) | Spider ${slayers.spiders.level} (${format(slayers.spiders.xp)}) | Wolf ${slayers.wolves.level} (${format(slayers.wolves.xp)}) | Ender ${slayers.enders.level} (${format(slayers.enders.xp)}) | Blaze ${slayers.blazes.level} (${format(slayers.blazes.xp)}) | Vamp ${slayers.vamps.level} (${format(slayers.vamps.xp)})`);
	}
};

function format(value) {
	if (value >= 1e12) return (Math.floor(value / 1e10) / 100).toFixed(2) + 'T';
	if (value >= 1e9) return (Math.floor(value / 1e8) / 10).toFixed(1) + 'B';
	if (value >= 1e6) return (Math.floor(value / 1e6)).toFixed(1) + 'M';
	if (value >= 1e3) return Math.floor(value / 1e3) + 'k';
	return Math.floor(value.toString());
}
