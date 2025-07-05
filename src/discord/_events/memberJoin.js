import { Events } from 'discord.js';
import { config, DCsend, getChannel } from '../../utils/utils.js';

export default {
	name: Events.GuildMemberAdd,

	async execute(member) {
		const addedRoles = [];

		if (config.welcome.message.enabled) {
			const channel = getChannel(config.welcome.message.channelID);
			if (!channel) return console.error('! Welcome Channel', 'Invalid channel ID for welcome message!');

			try {
				DCsend(channel, [{ embed:[{
					desc: config.welcome.message.message ? config.welcome.message.message.replace('@member', member.toString()) : `### Welcome to ${config.guild.name || getChannel(config.logs.bot.channelID).guild.name}!\n### ${member.toString()}`,
					icon: { url: member.user.displayAvatarURL() }
				}] }]);
			}
			catch (e) {
				if (e.message.includes('Missing Permissions')) {
					return console.error('! Welcome Message', 'I don\'t have permission to send the welcome message!');
				}
				else {
					return console.error('! Welcome Message', e);
				}
			}
		}

		// if (config.welcome.autoLink) {

		// }

		if (config.welcome.role.enabled) {
			for (const role of config.welcome.role.roleIDs) {
				if (!role) continue;

				const isValid = member.guild.roles.cache.get(role);
				if (!isValid) {
					console.error('! Welcome Role', `Invalid welcome role ID: ${role}`);
					continue;
				}

				// if (config.welcome.removeRoleOnLink.enabled && config.welcome.removeRoleOnLink.roleIDs.has(role)) {
				// 	if
				// }

				try {
					await member.roles.add(role);
					addedRoles.push(role);
				}
				catch (e) {
					if (e.message.includes('Missing Access')) {
						return console.error('! Welcome Role', `I don\'t have permission to assign the welcome role: <@${role}>`);
					}
					else {
						return console.error('! Welcome Role', e);
					}
				}
			}
		}

		if (config.logs.bot.memberJoin) {
			let rolesDesc = '';
			if (addedRoles.length === 1) {
				rolesDesc = `\n\n**Role Added:**\n<@&${addedRoles[0]}>`;
			}
			else if (addedRoles.length > 1) {
				rolesDesc = `\n\n**Roles Added:**\n${addedRoles.map(roleId => `<@&${roleId}>`).join('\n')}`;
			}

			DCsend(config.logs.bot.channelID, [{ embed: [{
				desc: `### New Member\n${member.toString()}\nAccount created <t:${(member.user.createdTimestamp / 1000).toFixed()}:R>${rolesDesc}`,
				icon: { url: member.user.displayAvatarURL() }
			}] }]);
		}
	}
};
