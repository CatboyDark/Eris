import { config, createMsg, getEmoji, getUser, membersDB } from '../../../utils/utils.js';

export default {
	name: 'unlink',
	desc: 'Unlink your account',

	async execute(interaction) {
		const result = await membersDB.findOneAndDelete({ dcid: interaction.user.id });
		if (!result) return interaction.reply(createMsg([{ color: 'Error', embed: [{ desc: '**You are not linked!**' }] }], { ephemeral: true }));

		if (config.link.role.enabled && interaction.member.roles.cache.has(config.link.role.roleID)) {
			await interaction.member.roles.remove(config.link.role.roleID);
		}
		if (config.welcome.role.enabled) {
			for (const roleID of config.welcome.role.roleIDs) {
				if (interaction.member.roles.cache.has(roleID)) await interaction.member.roles.remove(roleID);
			}
		}

		const check = await getEmoji('check');
		const user = await getUser(result.uuid);
		interaction.reply(createMsg([{ embed: [{ desc: `${check} **${user.ign} is now unlinked!**` }] }], { ephemeral: true }));
	}
};
