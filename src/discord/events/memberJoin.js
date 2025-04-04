import { Events } from 'discord.js';
import display from '../../display.js';
import { createMsg, readConfig } from '../../helper.js';

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

	const welcomeMsg = config.welcome.message.message ||
		`### Welcome to the ${config.guild.name ?? client.channels.cache.get(config.logs.channel)?.guild.name} server!`;

	await welcomeChannel.send({
		content: member.toString(),
		embeds: [createMsg({
			desc: welcomeMsg,
			icon: member.user.displayAvatarURL()
		})]
	});
}

async function welcomeRole(member, config) {
	try {
		await member.roles.add(config.welcome.role.role);
	}
	catch (e) {
		if (e.message.includes('Missing Permissions')) {
			display.r('I don\'t have permission to assign the welcome role!');
		}
	}
}
