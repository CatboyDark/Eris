import { getSkyblock, getUser, InvalidPlayer } from '../../utils/utils.js';

export default {
	name: 'catacombs',
	prefix: true,
	aliases: ['cata'],
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
		}

		const cata = player.cata;
		if (!cata.level) return message.reply(`${user.ign} has not played dungeons on ${profileName}!`);

		if (cata.secrets > 1000000) {
			cata.secrets = `${(cata.secrets / 1000000).toFixed(1)}M`;
		}
		else if (cata.secrets > 1000) {
			cata.secrets = `${Math.floor(cata.secrets / 1000)}k`;
		}

		message.reply(`${user.ign}: Cata ${Math.floor1(cata.level)} | ➶${Math.floor(cata.classes.archer)} ⚡${Math.floor(cata.classes.mage)} ☄${Math.floor(cata.classes.berserk)} ⚓${Math.floor(cata.classes.tank)} ⚚${Math.floor(cata.classes.healer)} Class Avg ${Math.floor1(cata.classAvg)} | Secrets: ${cata.secrets} (${Math.floor1(cata.spr)} S/R)`);
	}
};
