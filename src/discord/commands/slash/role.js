// import { createMsg } from '../../../utils/utils.js';

// export default {
// 	name: 'role',
// 	desc: 'Add or remove a user\'s roles',
// 	options: [
// 		{ type: 'user', name: 'user', desc: 'Select a user', required: true },
// 		{ type: 'role', name: 'role', desc: 'Select a role', required: true },
// 		{ type: 'role', name: 'role_', desc: 'Select a role' },
// 		{ type: 'role', name: 'role__', desc: 'Select a role' },
// 		{ type: 'role', name: 'role___', desc: 'Select a role' },
// 		{ type: 'role', name: 'role____', desc: 'Select a role' },
// 		{ type: 'role', name: 'role_____', desc: 'Select a role' },
// 		{ type: 'role', name: 'role______', desc: 'Select a role' },
// 		{ type: 'role', name: 'role_______', desc: 'Select a role' },
// 		{ type: 'role', name: 'role________', desc: 'Select a role' }
// 	],
// 	permissions: 0,

// 	async execute(interaction) {
// 		interaction.deferReply({ ephemeral: true });

// 		const member = interaction.options.getMember('user');
// 		const roles =
// 		[
// 			interaction.options.getRole('role'),
// 			interaction.options.getRole('role_'),
// 			interaction.options.getRole('role__'),
// 			interaction.options.getRole('role___'),
// 			interaction.options.getRole('role____'),
// 			interaction.options.getRole('role_____'),
// 			interaction.options.getRole('role______'),
// 			interaction.options.getRole('role_______'),
// 			interaction.options.getRole('role________')
// 		].filter((role) => role);

// 		const uniqueRoles = Array.from(new Set(roles.map((role) => role.id))).map((id) => roles.find((role) => role.id === id));
// 		const noPerms = uniqueRoles.filter((role) => role.managed || interaction.member.roles.highest.comparePositionTo(role) <= 0);
// 		const validRoles = uniqueRoles.filter((role) => !noPerms.includes(role));

// 		if (noPerms.length) {
// 			const noPermRoles = noPerms.map((role) => `- <@&${role.id}>`).join('\n');
// 			const desc = noPerms.length === 1
// 				? `**You do not have permission to manage this role:**\n\n${noPermRoles}`
// 				: `**You do not have permission to manage these roles:**\n\n${noPermRoles}`;
// 			return interaction.editReply(createMsg([{ color: 'Error', embed: [{ desc }] }]));
// 		}

// 		const addRoles = validRoles.filter((role) => !member.roles.cache.has(role.id));
// 		const removeRoles = validRoles.filter((role) => member.roles.cache.has(role.id));

// 		if (removeRoles.length) await member.roles.remove(removeRoles);
// 		if (addRoles.length) await member.roles.add(addRoles);
// 	}
// };

// add checks for bot permissions as well as user permissions