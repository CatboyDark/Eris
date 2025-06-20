import fs from 'fs';
import { ActivityType, Events } from 'discord.js';
import { config, saveConfig, getChannel, DCsend, getGuild, getEmoji } from '../../utils/utils.js';
import { getMongo, gxpSchema, membersSchema } from '../../mongo/schemas.js';
import { schedule } from 'node-cron';

export default {
	name: Events.ClientReady,

	async execute(client) {
		console.cyan(`${client.user.username} is online!`);

		await createLogsChannel(client);
		DCsend(config.logs.bot.channel, [{ embed: [{ desc: `**${client.user.username}** is online!` }]} ]);

		await initEmojis(client);

		let guild;
		if (config.ign) {
			try {
				guild = await getGuild.player(config.ign);
			}
			catch (e) {
				if (e.message.includes('Invalid Player')) console.red('ERROR: Invalid Player! Please enter a valid IGN in the config.');
			}

			if (guild) {
				config.guild.name = guild.name;
				saveConfig();
			}
		}

		client.user.setActivity(config.guild.name ?? getChannel(config.logs.channel).guild.name, { type: ActivityType.Watching });

		await getChannel(config.logs.bot.channel).guild.members.fetch();

		schedule('0 0 * * *',
			async () => {
				if (config.guild.name) {
					let guild;
					try {
						guild = await getGuild.name(config.guild.name);
					}
					catch (e) {
						console.error('! getGuild >', e);
					}

					await logGXP(guild);
					await syncRoles(guild);
					await updateStatsChannels(client, guild);
				}
			},
			{
				timezone: 'America/Los_Angeles'
			}
		);
	}
};

async function createLogsChannel(client) {
	if (!config.logs.channel) {
		if (client.guilds.cache.size > 1) {
			return console.red('ERROR: The bot is in multiple Discord servers! Please specify a logs channel in the config.');
		}
		else if (client.guilds.cache.size === 1) {
			const guild = client.guilds.cache.first();
			const channel = await guild.channels.create({
				name: 'logs',
				type: 0,
				permissionOverwrites: [
					{
						id: guild.roles.everyone.id,
						deny: ['ViewChannel']
					}
				]
			});
			config.logs.channel = channel.id;
			saveConfig();
		}
		else if (client.guilds.cache.size === 0) {
			return console.red('ERROR: The bot is not in any Discord servers!');
		}
	}

	const logsChannel = getChannel(config.logs.channel);
	if (!logsChannel.threads.cache.find(x => x.name === 'Bot')) {
		const channel = await logsChannel.threads.create({ name: 'Bot' });
		config.logs.bot.channel = channel.id;
		saveConfig();
	}
	if (config.logs.console.enabled && !logsChannel.threads.cache.find(x => x.name === 'Console')) {
		const channel = await logsChannel.threads.create({ name: 'Console' });
		config.logs.console.channel = channel.id;
		saveConfig();
	}
}

async function initEmojis(client) {
	try {
		const app = await client.application.fetch();
		const emojis = await app.emojis.fetch();

		const emojiFiles = fs.readdirSync('./assets/emojis').filter((file) => file.endsWith('.png'));
		const map = new Map(emojis.map(emoji => [emoji.name, emoji]));

		for (const [name, emoji] of map) {
			if (!emojiFiles.includes(`${name}.png`)) {
				await emoji.delete();
			}
		}

		for (const emojiFile of emojiFiles) {
			const emojiName = emojiFile.split('.')[0];

			if (map.has(emojiName)) {
				const emoji = map.get(emojiName);
				await emoji.edit({ name: emojiName });
			}
			else {
				await app.emojis.create({ attachment: `./assets/emojis/${emojiFile}`, name: emojiName });
			}
		}
	}
	catch (e) {
		console.error('! Emojis', e);
	}
}

async function logGXP(guild) {
	if (!config.guild.logGXP) return;

	const db = getMongo('gxp', gxpSchema);
	const data = [];

	for (const member of guild.members) {
		for (const [date, gxp] of Object.entries(member.expHistory)) {
			data.push({
				date: Number(date.replace(/-/g, '')),
				uuid: member.uuid,
				gxp
			});
		}
	}

	const write = data.map(({ date, uuid, gxp }) => ({
		updateOne: {
			filter: { date, uuid },
			update: { $set: { gxp } },
			upsert: true
		}
	}));

	try {
		await db.bulkWrite(write);
		DCsend(config.logs.bot.channel, [{
			embed: [{ desc:
				'### GXP Logger\n' +
				`GXP has been logged for ${guild.members.length} members.`
			}],
			timestamp: 'f'
		}]);
	}
	catch(e) {
		console.error('! logGXP', e);
	}
}

async function syncRoles(guild) {
	const plus = await getEmoji('plus');
	const minus = await getEmoji('minus');

	if (config.guild.role.sync) {
		const guildRole = getChannel(config.logs.bot.channel).guild.roles.cache.get(config.guild.role.role);
		if (!guildRole) return console.error('! Guild Role', 'Invalid Guild Role!');

		const db = getMongo('members', membersSchema);
		const memberUUIDs = new Set(guild.members.map(member => member.uuid));

		const addedRoles = [];
		const removedRoles = [];

		try {
			for (const [dcid, member] of guildRole.members) {
				const linked = await db.findOne({ dcid });
				if (!linked || !memberUUIDs.has(linked.uuid)) {
					await member.roles.remove(guildRole);
					removedRoles.push(member.user.id);
				}
			}

			for (const member of guild.members) {
				const linked = await db.findOne({ uuid: member.uuid });
				if (linked) {
					let DCmember;
					try {
						DCmember = getChannel(config.logs.bot.channel).guild.members.cache.get(linked.dcid);
					}
					catch (e) {
						if (e.code === 10007) continue;
					}

					if (DCmember && !DCmember.roles.cache.has(guildRole.id)) {
						await DCmember.roles.add(guildRole);
						addedRoles.push(DCmember.user.id);
					}
				}
			}
		}
		catch (e) {
			if (e.message.includes('Missing Permissions')) {
				return console.error('! Sync Roles', 'I don\'t have permission to assign the Guild Member role!');
			}
			else {
				return console.error('! Sync Roles', e);
			}
		}

		let desc = '### Role Syncing\nGuild member role has been synced!';
		if (addedRoles.length) desc += `\n\n${addedRoles.map((user) => `${plus} <@${user}>`).join('\n')}`;
		if (removedRoles.length) desc += `\n\n${removedRoles.map((user) => `${minus} <@${user}>`).join('\n')}\n`;

		DCsend(config.logs.bot.channel, [{ embed: [{ desc }], timestamp: 'f' } ]);
	}
}

async function updateStatsChannels(client, guild) {
	try {
		if (!config.statsChannels.category) {
			const category = await getChannel(config.logs.bot.channel).guild.channels.create({
				name: 'Guild Stats',
				type: 4,
				position: 0
			});
			config.statsChannels.category = category.id;
			saveConfig();
		}
		const category = getChannel(config.statsChannels.category);
		if (!category) return console.error('! Stats Channels', 'Invalid stats channels category ID!');

		if (config.statsChannels.guildLevel.enabled) {
			const name = config.statsChannels.guildLevel.name ? config.statsChannels.guildLevel.name.replace('#level', guild.level.toFixed(1)) : `⭐ Level: ${guild.level.toFixed(1)}`;
			if (!config.statsChannels.guildLevel.channel) {
				const channel = await getChannel(config.logs.bot.channel).guild.channels.create({
					name,
					type: 2,
					parent: config.statsChannels.category,
					permissionOverwrites: [
						{
							id: getChannel(config.logs.bot.channel).guild.roles.everyone.id,
							deny: ['Connect']
						},
						{
							id: client.user.id,
							allow: ['Connect']
						}
					]
				});
				config.statsChannels.guildLevel.channel = channel.id;
				saveConfig();
			}

			const channel = getChannel(config.statsChannels.guildLevel.channel);
			if (!channel) return console.error('! Stats Channels', 'Invalid stats channel ID for Guild Level!');

			channel.setName(name);
		}
		if (config.statsChannels.members.enabled) {
			const name = config.statsChannels.members.name ? config.statsChannels.members.name.replace('#members', guild.members.length) : `😋 Members: ${guild.members.length}/125`;
			if (!config.statsChannels.members.channel) {
				const channel = await getChannel(config.logs.bot.channel).guild.channels.create({
					name,
					type: 2,
					parent: config.statsChannels.category,
					permissionOverwrites: [
						{
							id: getChannel(config.logs.bot.channel).guild.roles.everyone.id,
							deny: ['Connect']
						},
						{
							id: client.user.id,
							allow: ['Connect']
						}
					]
				});
				config.statsChannels.members.channel = channel.id;
				saveConfig();
			}
			const channel = await getChannel(config.statsChannels.members.channel);
			if (!channel) return console.error('! Stats Channels', 'Invalid stats channel ID for Guild Members!');

			channel.setName(name);
		}
	}
	catch (e) {
		if (e.message.includes('Missing Permissions')) {
			return console.error('! Stats Channels', 'I don\'t have permission to update the stats channels!');
		}
		else if (e.message.includes('Missing Access')) {
			return console.error('! Stats Channels', 'I need the \'Connect\' channel permission to update the stats channels!');
		}
		else {
			return console.error('! Stats Channels', e);
		}
	}

	DCsend(config.logs.bot.channel, [{ embed: [{ desc: '### Stats Channels\nStats channels have been updated!' }], timestamp: 'f' }]);
}
