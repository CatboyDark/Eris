import { createMsg, getUser, read } from '../../../utils/utils.js';

export default {
	name: 'guildban',
	desc: 'Ban a player from the guild',
	options: [
		{ type: 'string', name: 'ign', desc: 'Enter a player', required: true }
	],
	permissions: 0,

	async execute(interaction) {
		const target = interaction.options.getString('ign');

		const user = await getUser(target);
		const blacklist = read('./.cache/bot/guildBlacklist.json');

		if (blacklist.includes(user.id)) {
			return interaction.reply(createMsg([{ embed: [{ desc: `**${user.ign} is already banned from the guild!**` }] }], { ephemeral: true }));
		}
		else {
			blacklist.push(user.id);
			blacklist.write();

			return interaction.reply(createMsg([{ embed: [{ desc: `**${user.ign} has been banned from the guild!**` }] }], { ephemeral: true }));
		}
	}
};
