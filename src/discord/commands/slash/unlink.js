import { Config, createMsg, getEmoji, getUserByUUID, LinkedUsers } from '../../../utils/utils.js';

export default {
	name: 'unlink',
	desc: 'Unlink your account',

	async execute(interaction) {
		const index = LinkedUsers.findIndex(u => u.dcid === interaction.user.id);
		let result = null;

		if (index !== -1) {
			result = LinkedUsers[index];
			LinkedUsers.splice(index, 1);
			LinkedUsers.write();
		}

		if (!result) return interaction.reply(createMsg([{ color: 'Error', embed: [{ desc: '**You are not linked!**' }] }], { ephemeral: true }));

		if (Config.link.role.enabled && interaction.member.roles.cache.has(Config.link.role.roleID)) {
			await interaction.member.roles.remove(Config.link.role.roleID);
		}
		if (Config.welcome.role.enabled) {
			for (const roleID of Config.welcome.role.roleIDs) {
				if (interaction.member.roles.cache.has(roleID)) await interaction.member.roles.remove(roleID);
			}
		}

		const check = await getEmoji('check');
		const user = await getUserByUUID(result.uuid);
		interaction.reply(createMsg([{ embed: [{ desc: `${check} **${user.ign} is now unlinked!**` }] }], { ephemeral: true }));
	}
};
