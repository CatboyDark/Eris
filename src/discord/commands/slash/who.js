import { createMsg } from '../../../helper.js';

export default {
	name: 'who',
	desc: 'Who is this?',
	options: [
		{ type: 'user', name: 'member', desc: 'Select a member' }
	],

	async execute(interaction) {
		const user = interaction.options.getMember('member') || interaction.user;

		const member = await interaction.guild.members.fetch(user.id);
		const isOwner = member.id === interaction.guild.ownerId;

		const roles = member.roles.cache
			.filter(role => role.name !== '@everyone')
			.sort((a, b) => b.position - a.position)
			.map(role => `<@&${role.id}>`)
			.join('\n');

		const ePermissions = interaction.guild.roles.everyone.permissions.toArray();
		let permissions = member.permissions.toArray().filter(permission => !ePermissions.includes(permission));
		if (permissions.includes('Administrator')) {
			permissions = ['**Administrator**'];
		}
		if (isOwner) {
			permissions = [':star: **Server Owner**', ...permissions];
		}
		permissions = permissions.join('\n');

		const roleTitle = roles ? '### Roles' : '**This user has no roles!**';
		const permissionsTitle = permissions ? '### Permissions' : '';
		interaction.reply({ embeds: [createMsg({ title: member.nickname || user.username, desc: `${roleTitle}\n${roles}\n${permissionsTitle}\n${permissions}`, icon: user.displayAvatarURL() })] });
	}
};
