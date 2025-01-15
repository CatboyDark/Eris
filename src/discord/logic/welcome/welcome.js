import { createMsg } from '../../../helper/builder.js';
import { readConfig } from '../../../helper/utils.js';

async function welcomeMsg(member)
{
	const config = readConfig();
	if (!config.features.welcomeMsgToggle) return;

	const welcomeChannel = member.guild.channels.cache.get(config.features.welcomeChannel);
	if (welcomeChannel.guild.id !== member.guild.id) return;

	let welcomeMsg = config.features.welcomeMsg || `### Welcome to the ${config.guild} server!\n### @member`;
	welcomeMsg = welcomeMsg.replace(/@member/g, member.toString());
	const msg = createMsg({ desc: welcomeMsg, icon: member.user.displayAvatarURL() });

	await welcomeChannel.send({ embeds: [msg] });
}

async function welcomeRole(member)
{
	const config = readConfig();
	if (!config.features.welcomeRoleToggle)
	{
		return;
	}

	await member.roles.add(config.features.welcomeRole);
}

export 
{
	welcomeMsg,
	welcomeRole
};
