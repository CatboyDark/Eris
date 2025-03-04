import { createMsg, getEmoji } from '../../../helper.js';

export default
{
	name: 'role',
	desc: 'Add or remove a user\'s roles',
	options: [
		{ type: 'user', name: 'user', desc: 'Select a user', required: true },
		{ type: 'role', name: 'role', desc: 'Select a role', required: true },
		{ type: 'role', name: 'role_', desc: 'Select a role' },
		{ type: 'role', name: 'role__', desc: 'Select a role' },
		{ type: 'role', name: 'role___', desc: 'Select a role' },
		{ type: 'role', name: 'role____', desc: 'Select a role' }
	],
	permissions: ['ManageRoles'],

	async execute(interaction) {
		await interaction.deferReply();

		const plus = await getEmoji('plus');
		const minus = await getEmoji('minus');

		const member = interaction.options.getMember('user');
		const roles =
		[
			interaction.options.getRole('role'),
			interaction.options.getRole('role_'),
			interaction.options.getRole('role__'),
			interaction.options.getRole('role___'),
			interaction.options.getRole('role____'),
			interaction.options.getRole('role_____'),
			interaction.options.getRole('role______'),
			interaction.options.getRole('role_______'),
			interaction.options.getRole('role________'),
			interaction.options.getRole('role_________')
		].filter((role) => role);

		const uniqueRoles = Array.from(new Set(roles.map((role) => role.id))).map((id) => roles.find((role) => role.id === id));
		const noPerms = uniqueRoles.filter((role) => role.managed || interaction.member.roles.highest.comparePositionTo(role) <= 0);
		const validRoles = uniqueRoles.filter((role) => !noPerms.includes(role));

		if (noPerms.length > 0) {
            const noPermRoles = noPerms.map((role) => `- <@&${role.id}>`).join('\n');
            const errorMsg = noPerms.length === 1
                ? `**You do not have permission to manage this role:**\n\n${noPermRoles}`
                : `**You do not have permission to manage these roles:**\n\n${noPermRoles}`;
            await interaction.editReply({ embeds: [createMsg({ color: 'Red', desc: errorMsg })] });
        }

		const roleAdd = validRoles.filter((role) => !member.roles.cache.has(role.id));
		const roleRemove = validRoles.filter((role) => member.roles.cache.has(role.id));

		if (roleRemove.length > 0) {
			await member.roles.remove(roleRemove);
		}
		if (roleAdd.length > 0) {
			await member.roles.add(roleAdd);
		}

		if (roleAdd.length > 0 || roleRemove.length > 0) {
			const addedRoles = roleAdd.length > 0 ? roleAdd.map((role) => `${plus} <@&${role.id}>`).join('\n') : '';
			const removedRoles = roleRemove.length > 0 ? roleRemove .map((role) => `${minus} <@&${role.id}>`).join('\n') : '';

			const desc = [addedRoles, removedRoles].filter(Boolean).join('\n\n');

			await interaction.editReply({ embeds: [createMsg({ desc: `${member} **Updated roles!**\n\n${desc}` })] });
		}
	}
};
