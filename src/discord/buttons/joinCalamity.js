import { PermissionFlagsBits } from 'discord.js';
import { createMsg, DCsend } from '../../utils/utils.js';
import { DCserver } from '../_events/clientReady.js';

export default [{
	id: 'joinCalamity',

	async execute(interaction) {
		const user = interaction.member;

		

		const channel = await DCserver.channels.create({
			name: `${user}`,
			type: 2,
			parent: 1413158284478648331,
			permissionOverwrites: [
				{
					id: DCserver.roles.everyone.id,
					deny: [PermissionFlagsBits.ViewChannel]
				},
				{
					id: user.id,
					allow: [PermissionFlagsBits.ViewChannel]
				},
				{
					id: 700177102925987850,
					allow: [PermissionFlagsBits.ViewChannel]
				}
			]
		});

		await DCsend(channel, [
			{
				embed: [{ desc:
					'## Thank you for choosing Calamity!\n' +
					''
				}]
			}
		])
	}
}];

// 1413158284478648331

/*

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

*/
