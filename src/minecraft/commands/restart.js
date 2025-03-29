import { getPerms, getUser, readConfig } from '../../helper.js';
import { getMongo, membersSchema } from '../../mongo/schemas.js';
import { discord } from '../../discord/Discord.js';
import { restart } from '../../discord/commands/slash/restart.js';

export default {
	name: 'restart',
	prefix: true,
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['ign'],

	async execute(message) {
		const user = await getUser(message.sender);
		const members = getMongo('Eris', 'members', membersSchema);

		const match = await members.findOne({ uuid: user.id });
		if (!match.dcid) return;

		const config = readConfig();

		const server = discord.channels.cache.get(config.logs.channel).guild;
		const member = await server.fetch(match.dcid);
		const perms = getPerms(member);

		if (!perms.includes('RestartBot')) return;

		await message.reply('Restarting...');
		await restart();
	}
};
