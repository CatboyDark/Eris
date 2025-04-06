import { PermissionFlagsBits } from 'discord.js';
import { getGuild, getPerms, readConfig, writeConfig } from '../../../utils/utils.js';

export default {
	name: 'setstats',
	prefix: true,

	async execute(message) {
		const perms = getPerms(message.member);
		if (!perms.includes('SetStatsChannels')) return;

		const config = readConfig();
		const guild = await getGuild.name(config.guild.name);

		const category = await message.guild.channels.create({
			name: 'GUILD STATS',
			type: 4,
			position: 0
		});

		const denyPermissions = [{
			id: message.guild.roles.everyone.id,
			deny: [PermissionFlagsBits.Connect]
		}];

		const levelChannel = await message.guild.channels.create({
			name: `⭐ Level: ${Number(Math.floor(guild.level.toFixed(1)))}`,
			type: 2,
			parent: category.id,
			permissionOverwrites: denyPermissions
		});

		const membersChannel = await message.guild.channels.create({
			name: `😋 Members: ${guild.members.length}/125`,
			type: 2,
			parent: category.id,
			permissionOverwrites: denyPermissions
		});

		config.statsChannels.level = levelChannel.id;
		config.statsChannels.members = membersChannel.id;
		writeConfig(config);

		message.delete();
	}
};
