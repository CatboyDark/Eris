import { getGuild, getUser, InvalidPlayer } from '../../utils/utils.js';

export default {
	name: 'guild',
	prefix: true,
	aliases: ['g'],
	channels: ['guild', 'officer', 'party', 'dm'],
	options: ['ign'],

	async execute(message) {
		let user;
		if (message.options.ign) {
			try {
				user = await getUser(message.options.ign);
			}
			catch (e) {
				if (e instanceof InvalidPlayer) return message.reply(`${message.options.ign}: Invalid player!`);
				else console.error('Error | MC command: guild', e);
			}
		}
		else {
			user = await getUser(message.sender);
		}

		const guild = await getGuild.player(user.id);
		if (!guild) return message.reply(`${user.ign} isn't in a guild!`);

		const member = guild.members.find(member => member.uuid === user.id);
		message.reply(`${user.ign}: ${guild.name} | Weekly GXP: ${format(member.weeklyGXP)}`);
	}
};

function format(value) {
	if (value >= 1e12) return Math.floor2(value / 1e12) + 'T';
	if (value >= 1e9) return Math.floor2(value / 1e9) + 'B';
	if (value >= 1e6) return Math.floor(value / 1e6) + 'M';
	if (value >= 1e3) return Math.floor(value / 1e3) + 'k';
	return Math.floor(value);
}
