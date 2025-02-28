import { Events } from 'discord.js';
import display from '../../display.js';
import { createMsg, readConfig } from '../../helper.js';

export default {
	name: Events.GuildMemberAdd,
	async execute(member) {
		const config = readConfig();

		if (config.welcome.messageToggle) {
			await welcomeMessage(member, config);
		}

		if (config.welcome.roleToggle) {
			await welcomeRole(member, config);
		}
	}
};

async function welcomeMessage(member, config) {
	const welcomeChannel = member.guild.channels.cache.get(config.welcome.channel);

	if (welcomeChannel.guild.id !== member.guild.id) return;

	let welcomeMsg = config.welcome.message ||
		`### Welcome to the ${config.guild.name ?? client.channels.cache.get(config.logsChannel)?.guild.name} server!\n### @member`;

	welcomeMsg = welcomeMsg.replace(/@member/g, member.toString());

	await welcomeChannel.send({
		embeds: [createMsg({
			desc: welcomeMsg,
			icon: member.user.displayAvatarURL()
		})]
	});
}

async function welcomeRole(member, config) {
	try {
		await member.roles.add(config.welcome.role);
	}
	catch (e) {
		if (e.message.includes('Missing Permissions')) {
			display.r('I don\'t have permission to assign the welcome role!');
		}
	}
}
