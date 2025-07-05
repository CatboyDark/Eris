// import { Events } from 'discord.js';

// export default {
// 	name: Events.GuildMemberUpdate,

// 	async execute(oldMember, newMember) {

// 		console.log(oldMember);
// 		console.log(newMember);

// 		const oldRoles = new Set(oldMember.roles.cache.keys());
// 		const newRoles = new Set(newMember.roles.cache.keys());

// 		const addedRoles = [...newRoles].filter(role => !oldRoles.has(role));
// 		const removedRoles = [...oldRoles].filter(role => !newRoles.has(role));
// 	}
// };
