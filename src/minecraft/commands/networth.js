import { getSkyblock, getUserByIGN, HypixelNoSkyblockData, InvalidPlayer } from '../../utils/utils.js';

export default {
	name: 'networth',
	prefix: true,
	aliases: ['nw'],
	channels: ['guild', 'officer', 'party', 'dm'],
	options: ['ign', 'profile'],

	async execute(message) {
		let user;
		if (message.options.ign) {
			try {
				user = await getUserByIGN(message.options.ign);
			}
			catch (e) {
				if (e instanceof InvalidPlayer) return message.reply(`${message.options.ign}: Invalid player!`);
				else console.error('Error | MCcommand: networth', e);
			}
		}
		else {
			user = await getUserByIGN(message.sender);
		}

		let player;
		try {
			player = await getSkyblock(user.id, { profile: message.options.profile, networth: true });
		}
		catch (e) {
			if (e instanceof HypixelNoSkyblockData) return message.reply(`${user.ign} has never played Skyblock!`);
			else console.error('Error | MCcommand: networth', e);
		}

		const bank = () => {
			if (player.bank_personal && player.bank < 1) {
				return format(player.bank_personal);
			}
			else {
				return `${format(player.bank)}${player.bank_personal ? ` + ${format(player.bank_personal)}` : ''}`
			}
		};
		
		message.reply(`${user.ign}'s Networth: ${format(player.networth)} | Purse: ${format(player.purse)} | Bank: ${bank()}`);
	}
};

function format(value) {
	if (value >= 1e12) return Math.floor2(value / 1e12) + 'T';
	if (value >= 1e9) return Math.floor1(value / 1e9) + 'B';
	if (value >= 1e6) return Math.floor(value / 1e6) + 'M';
	if (value >= 1e3) return Math.floor(value / 1e3) + 'k';
	return Math.floor(value);
}
