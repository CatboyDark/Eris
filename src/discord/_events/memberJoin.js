import { Events } from 'discord.js';
import { config, DCsend, getChannel, getEmoji, getGuild, getPlayer, getRole, membersDB } from '../../utils/utils.js';
// import { DCserver } from './clientReady.js';

export default {
	name: Events.GuildMemberAdd,

	async execute(member) {
		if (config.welcome.message.enabled) {
			const channel = getChannel(config.welcome.message.channelID);
			if (!channel) return console.error('Error | Welcome Channel', 'Invalid channel ID for welcome message!');

			try {
				DCsend(channel, [{ embed:[{
					desc: config.welcome.message.message ? config.welcome.message.message.replace('@member', member.toString()) : `### Welcome to ${config.guild.name || DCserver.name}!\n### ${member.toString()}`,
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

		if (config.welcome.autoLink) {
			const dcidDoc = await membersDB.findOne({ dcid: member.id });
			if (!dcidDoc) return;

			isLinked = true;

			const player = await getPlayer(dcidDoc.uuid);

			try {
				await member.setNickname(player.ign);
			}
			catch (e) {
				if (e.message.includes('Missing Permissions')) console.error('Error | Command: link', 'I don\'t have permission to assign nicknames!\n(I am also unable to nick the server owner)');
				else console.error('Error | Command: link', e);
			}

			if (config.link.role.enabled) {
				const roleID = config.link.role.roleID;
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

			if (config.guild.role.enabled && config.guild.name) {
				const guild = await getGuild.player(player.ign);
				const roleID = config.guild.role.roleID;
				if (!getRole(roleID)) return console.error('Error | Command: link', 'Invalid Guild Role!');

				try {
					if (guild.name === config.guild.name) {
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
		else if (config.welcome.role.enabled) {
			for (const roleID of config.welcome.role.roleIDs) {
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

		if (config.logs.bot.memberJoin) {
			let rolesDesc = '';
			if (isLinked) rolesDesc = `\n\n${check} **Autolinked!**\n\n${addedRoles.map(roleID => `${plus} <@&${roleID}>`).join('\n')}`;

			DCsend(config.logs.bot.channelID, [{ embed: [{
				desc: `### New Member\n${member.toString()}\nAccount created <t:${(member.user.createdTimestamp / 1000).toFixed()}:R>${rolesDesc}`,
				icon: { url: member.user.displayAvatarURL() }
			}] }]);
		}
	}
};
