import { PermissionFlagsBits } from 'discord.js';
import { Config, createMsg, DCsend, getChannel, getGuild, getSkyblock, GetUserByID, LinkedUsers } from '../../utils/utils.js';
import { DCserver } from '../_events/clientReady.js';
import { discord } from '../Discord.js';

export default [{
	id: 'joinCalamity',

	async execute(interaction) {
		const category = getChannel('1413158284478648331');
		if (category.children.cache.find(c => c.name === interaction.member.displayName.toLowerCase())) return interaction.reply(createMsg([{ color: 'Error', embed: [{ desc: '**You already have a ticket!**' }] }], { ephemeral: true }));

		const isLinked = LinkedUsers.find(u => u.dcid === interaction.member.id);
		if (!isLinked) return interaction.reply(createMsg([{ color: 'Error', embed: [{ desc: '**You are not linked! Run /link to link your account.**' }] }], { ephemeral: true }));

		const minecraftUser = await GetUserByID(isLinked.uuid);
		const profiles = await getSkyblock(isLinked.uuid, { all: true });
		const guild = await getGuild.name(Config.guild.name);

		const userGuild = await getGuild.player(isLinked.uuid);
		if (userGuild && userGuild.name === Config.guild.name) return interaction.reply(createMsg([{ color: 'Error', embed: [{ desc: '**You\'re already in the guild, you silly goober!**' }] }], { ephemeral: true }));

		const values = Object.values(profiles);

		const highestLevel = values.reduce((highest, value) =>
			!highest || value.level > highest.level ? value : highest, null
		);

		const highestCata = values.reduce((highest, value) =>
			!highest || value.cata.level > highest.cata.level ? value : highest, null
		);

		const meetsRequirements = highestLevel.level >= Config.minecraft.memberJoin.autoAccept.levelRequirement || highestCata.cata.level >= Config.minecraft.memberJoin.autoAccept.cataRequirement;
		const profilesToDisplay = highestLevel === highestCata
			?
				`**${highestLevel.name}${highestLevel.type === 'Ironman' ? '♲' : ''}**\n` +
				`Level **${Math.floor(highestLevel.level)}**\n` +
				`Cata **${Math.floor(highestLevel.cata.level)}**`
			:
				`**${highestLevel.name}${highestLevel.type === 'Ironman' ? '♲' : ''}**\n` +
				`Level **${Math.floor(highestLevel.level)}**\n` +
				`Cata **${Math.floor(highestLevel.cata.level)}**\n\n` +

				`**${highestCata.name}${highestCata.type === 'Ironman' ? '♲' : ''}**\n` +
				`Level **${Math.floor(highestCata.level)}**\n` +
				`Cata **${Math.floor(highestCata.cata.level)}**`;
		const slots = meetsRequirements
			? guild.members.length < 125
				? `Available slots: **${125 - guild.members.length}**\nYou may run \`/g join Calamity\` when you're ready!\n\n`
				: '**No available guild slots!**\nYou will be notified when you\'re able to join. Thank you for your patience!\n\n'
			: '';

		const channel = await DCserver.channels.create({
			name: `${interaction.member.displayName}`,
			type: 0,
			parent: '1413158284478648331',
			permissionOverwrites: [
				{
					id: DCserver.roles.everyone.id,
					deny: [PermissionFlagsBits.ViewChannel]
				},
				{
					id: interaction.member.id,
					allow: [PermissionFlagsBits.ViewChannel]
				},
				{
					id: discord.user.id,
					allow: [PermissionFlagsBits.ViewChannel]
				},
				{
					id: '700177102925987850',
					allow: [PermissionFlagsBits.ViewChannel]
				}
			]
		});

		await DCsend(channel, [
			{ desc: `${interaction.user}` },
			{
				embed: [{ desc:
					'## Thank you for choosing Calamity!\n' +
					`${meetsRequirements ? 'Congrats! You meet the requirements to join our guild!' : 'Oh no! You don\'t meet the requirements to join our guild!'}\n` +
					`### ${minecraftUser.ign}\n\n` +
					`${profilesToDisplay}\n\n` +
					`${slots}` +
					'-# If you have any questions, please ping a staff member.'
				}]
			},
			[{ id: 'ticketClose', label: 'Close Ticket', color: 'Red' }]
		]);

		await interaction.reply(createMsg([{ embed: [{ desc: `**Your ticket has been created! ${channel}**` }] }], { ephemeral: true }));
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
