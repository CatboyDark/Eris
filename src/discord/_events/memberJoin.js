import { Events } from 'discord.js';
import { Config, DCsend, getChannel, getEmoji, getGuild, getPlayer, getRole, LinkedUsers } from '../../utils/utils.js';
// import { DCserver } from './clientReady.js';

export default {
	name: Events.GuildMemberAdd,

	async execute(member) {
		if (Config.welcome.message.enabled) {
			const channel = getChannel(Config.welcome.message.channelID);
			if (!channel) return console.error('Error | Welcome Channel', 'Invalid channel ID for welcome message!');

			try {
				DCsend(channel, [{ embed:[{
					desc: Config.welcome.message.message ? Config.welcome.message.message.replace('@member', member.toString()) : `### Welcome to ${Config.guild.name || DCserver.name}!\n### ${member.toString()}`,
					icon: { url: member.user.displayAvatarURL() }
				}] }]);
			}
			catch (e) {
				if (e.message.includes('Missing Permissions')) return console.error('Error | Welcome Message', 'I don\'t have permission to send the welcome message!');
				else return console.error('Error | Welcome Message', e);
			}
		}

		const addedRoles = [];
		let isLinked = false;

		if (Config.welcome.autoLink) {
			const user = LinkedUsers.find(u => u.dcid === member.id);
			if (!user) return;

			isLinked = true;

			const player = await getPlayer(user.uuid);

			try {
				await member.setNickname(player.ign);
			}
			catch (e) {
				if (e.message.includes('Missing Permissions')) console.error('Error | Command: link', 'I don\'t have permission to assign nicknames!\n(I am also unable to nick the server owner)');
				else console.error('Error | Command: link', e);
			}

			if (Config.link.role.enabled) {
				const roleID = Config.link.role.roleID;
				if (!getRole(roleID)) return console.error('Error | Command: link', 'Invalid Link Role!');

				try {
					await member.roles.add(roleID);
					addedRoles.push(roleID);
				}
				catch (e) {
					if (e.message.includes('Missing Permissions')) return console.error('Error | Command: link', 'I don\'t have permission to assign Link Role!');
					else return console.error('Error | Command: link', e);
				}
			}

			if (Config.guild.role.enabled && Config.guild.name) {
				const guild = await getGuild.player(player.ign);
				const roleID = Config.guild.role.roleID;
				if (!getRole(roleID)) return console.error('Error | Command: link', 'Invalid Guild Role!');

				try {
					if (guild.name === Config.guild.name) {
						await member.roles.add(roleID);
						addedRoles.push(roleID);
					}
				}
				catch (e) {
					if (e.message.includes('Missing Permissions')) return console.error('Error | Command: link', 'I don\'t have permission to assign/remove Guild Role!');
					else return console.error('Error | Command: link', e);
				}
			}
		}
		else if (Config.welcome.role.enabled) {
			for (const roleID of Config.welcome.role.roleIDs) {
				if (!getRole(roleID)) return console.error('Error | Welcome Role', `Invalid Welcome Role!${roleID ? ` (ID: ${roleID})` : ''}`);

				try {
					await member.roles.add(roleID);
				}
				catch (e) {
					if (e.message.includes('Missing Access')) return console.error('Error | Welcome Role', `I don\'t have permission to assign the welcome role: <@${roleID}>`);
					else return console.error('Error | Welcome Role', e);
				}
			}
		}

		const check = await getEmoji('check');
		const plus = await getEmoji('plus');

		if (Config.logs.bot.memberJoin) {
			let rolesDesc = '';
			if (isLinked) rolesDesc = `\n\n${check} **Autolinked!**\n\n${addedRoles.map(roleID => `${plus} <@&${roleID}>`).join('\n')}`;

			DCsend(Config.logs.bot.channelID, [{ embed: [{
				desc: `### New Member\n${member.toString()}\nAccount created <t:${(member.user.createdTimestamp / 1000).toFixed()}:R>${rolesDesc}`,
				icon: { url: member.user.displayAvatarURL() }
			}] }]);
		}
	}
};
