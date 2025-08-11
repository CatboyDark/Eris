import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { config, createMsg, getChannel, getGuild, saveConfig } from '../../utils/utils.js';
import { discord } from '../Discord.js';
import { DCserver } from '../_events/clientReady.js';

export default [{
	id: 'setStats',

	async execute(interaction) {
		const selection = interaction.values;

		const guild = await getGuild.name(config.guild.name);
		const category = getChannel(config.statsChannels.categoryID);
		if (!category) {
			const newCategory = await DCserver.channels.create({
				name: 'Guild Stats',
				type: ChannelType.GuildCategory,
				position: 0
			});
			config.statsChannels.categoryID = newCategory.id;
			saveConfig();
		}

		if (selection.includes('guildLevel')) {
			const guildLevel = getChannel(config.statsChannels.guildLevel.channelID);
			if (!guildLevel) {
				config.statsChannels.guildLevel.enabled = true;
				const channel = await DCserver.channels.create({
					name: config.statsChannels.guildLevel.name ? config.statsChannels.guildLevel.name.replace('#level', guild.level.toFixed(1)) : `⭐ Level: ${guild.level.toFixed(1)}`,
					type: 2,
					parent: config.statsChannels.categoryID,
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
				config.statsChannels.guildLevel.channelID = channel.id;
			}
		}
		if (selection.includes('guildMembers')) {
			const guildMembers = getChannel(config.statsChannels.guildMembers.channelID);
			if (!guildMembers) {
				config.statsChannels.guildMembers.enabled = true;
				const channel = await DCserver.channels.create({
					name: config.statsChannels.guildMembers.name ? config.statsChannels.guildMembers.name.replace('#members', guild.members.length) : `😋 Members: ${guild.members.length}/125`,
					type: 2,
					parent: config.statsChannels.categoryID,
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
				config.statsChannels.guildMembers.channelID = channel.id;
			}
		}
		saveConfig();

		interaction.reply(createMsg([{ embed: [{ desc: 'Stats Channels have been created!' }] }], { ephemeral: true }));
	}
}];
