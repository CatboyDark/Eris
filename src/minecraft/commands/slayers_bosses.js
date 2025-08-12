import { getSkyblock, getUser, HypixelNoSkyblockData, InvalidPlayer } from '../../utils/utils.js';

const commands = [];

const aliases = {
	zombie: ['zombies', 'revenant', 'revenants', 'rev', 'revs'],
	spider: ['spiders', 'tarantula', 'tarantulas', 'taran', 'tarans', 'tara', 'taras'],
	wolf: ['wolves', 'sven', 'svens'],
	ender: ['enders', 'endermen', 'enderman', 'voidgloom', 'voidglooms'],
	blaze: ['blazes', 'inferno', 'infernos'],
	vampire: ['vampires', 'vamp', 'vamps', 'riftstalker', 'riftstalkers']
};

for (const [slayer, aliasList] of Object.entries(aliases)) {
	commands.push({
		name: slayer,
		prefix: true,
		aliases: aliasList,
		channels: ['guild', 'officer', 'party', 'dm'],
		options: ['ign', 'profile'],

		async execute(message) {
			let user;
			if (message.options.ign) {
				try {
					user = await getUser(message.options.ign);
				}
				catch (e) {
					if (e instanceof InvalidPlayer) return message.reply(`${message.options.ign}: Invalid player!`);
					else console.error('Error | MCcommand: slayer_bosses', e);
				}
			}
			else {
				user = await getUser(message.sender);
			}

			let player;
			try {
				player = await getSkyblock(user.id, message.options.profile);
			}
			catch (e) {
				if (e instanceof HypixelNoSkyblockData) return message.reply(`${user.ign} has never played Skyblock!`);
				else console.error('Error | MCcommand: slayer_bosses', e);
			}

			const slayerData = player.slayers?.[slayer];
			const { level, xp, ...tiers } = slayerData;
			const kills = Object.entries(tiers).map(([tier, count]) => `${tier.toUpperCase()}: ${count}`).join(' | ');

			message.reply(`${user.ign}: ${slayer.charAt(0).toUpperCase() + slayer.slice(1)} ${level} (${format(xp)}) | ${kills}`);
		}
	});
}

export default commands;

function format(value) {
	if (value >= 1e12) return Math.floor2(value / 1e12) + 'T';
	if (value >= 1e9) return Math.floor2(value / 1e9) + 'B';
	if (value >= 1e6) return Math.floor(value / 1e6) + 'M';
	if (value >= 1e3) return Math.floor(value / 1e3) + 'k';
	return Math.floor(value);
}
