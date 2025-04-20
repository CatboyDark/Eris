import { Events } from 'discord.js';
import { createMsg, readConfig, Error } from '../../utils/utils.js';

export default {
	name: Events.GuildMemberAdd,
	async execute(member) {
		const config = readConfig();

		if (config.welcome.message.enabled) {
			await welcomeMessage(member, config);
		}

		if (config.welcome.role.enabled) {
			await welcomeRole(member, config);
		}
	}
};

async function welcomeMessage(member, config) {
	const welcomeChannel = member.guild.channels.cache.get(config.welcome.message.channel);

	if (welcomeChannel.guild.id !== member.guild.id) return;

	const welcomeMsg = config.welcome.message.message ??
		`### Welcome to the ${config.guild.name ?? client.channels.cache.get(config.logs.channel)?.guild.name} server!`;

	try {
		await welcomeChannel.send({
			content: member.toString(),
			embeds: [createMsg({
				desc: welcomeMsg,
				icon: member.user.displayAvatarURL()
			})]
		});
	}
	catch (e) {
		if (e.message.includes('Missing Permissions')) {
			await Error('! Welcome Message !', 'I don\'t have permission to send the welcome message!');
		}
		else {
			await Error('! Welcome Message !', e);
		}
	}
}

async function welcomeRole(member, config) {
	try {
		await member.roles.add(config.welcome.role.role);
	}
	catch (e) {
		if (e.message.includes('Missing Access')) {
			await Error('! Welcome Role !', 'I don\'t have permission to assign the welcome role!');
		}
		else {
			await Error('! Welcome Role !', e);
		}
	}
}
