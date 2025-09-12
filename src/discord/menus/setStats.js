import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { Config, createMsg, getChannel, getGuild } from '../../utils/utils.js';
import { discord } from '../Discord.js';
import { DCserver } from '../_events/clientReady.js';

export default [{
	id: 'setStats',

	async execute(interaction) {
		const selection = interaction.values;

		const guild = await getGuild.name(Config.guild.name);
		const category = getChannel(Config.statsChannels.categoryID);
		if (!category) {
			const newCategory = await DCserver.channels.create({
				name: 'Guild Stats',
				type: ChannelType.GuildCategory,
				position: 0
			});
			Config.statsChannels.categoryID = newCategory.id;
			Config.write();
		}

		if (selection.includes('guildLevel')) {
			const guildLevel = getChannel(Config.statsChannels.guildLevel.channelID);
			if (!guildLevel) {
				Config.statsChannels.guildLevel.enabled = true;
				const channel = await DCserver.channels.create({
					name: Config.statsChannels.guildLevel.name ? Config.statsChannels.guildLevel.name.replace('#level', guild.level.toFixed(1)) : `⭐ Level: ${guild.level.toFixed(1)}`,
					type: 2,
					parent: Config.statsChannels.categoryID,
					permissionOverwrites: [
						{
							id: DCserver.roles.everyone.id,
							deny: ['Connect']
						},
						{
							id: discord.user.id,
							allow: PermissionFlagsBits.Connect
						}
					]
				});
				Config.statsChannels.guildLevel.channelID = channel.id;
			}
		}
		if (selection.includes('guildMembers')) {
			const guildMembers = getChannel(Config.statsChannels.guildMembers.channelID);
			if (!guildMembers) {
				Config.statsChannels.guildMembers.enabled = true;
				const channel = await DCserver.channels.create({
					name: Config.statsChannels.guildMembers.name ? Config.statsChannels.guildMembers.name.replace('#members', guild.members.length) : `😋 Members: ${guild.members.length}/125`,
					type: 2,
					parent: Config.statsChannels.categoryID,
					permissionOverwrites: [
						{
							id: DCserver.roles.everyone.id,
							deny: ['Connect']
						},
						{
							id: discord.user.id,
							allow: PermissionFlagsBits.Connect
						}
					]
				});
				Config.statsChannels.guildMembers.channelID = channel.id;
			}
		}
		Config.write();

		interaction.reply(createMsg([{ embed: [{ desc: 'Stats Channels have been created!' }] }], { ephemeral: true }));
	}
}];
