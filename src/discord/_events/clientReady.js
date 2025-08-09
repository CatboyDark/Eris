import fs from 'fs';
import { ActivityType, Events, PermissionFlagsBits } from 'discord.js';
import { config, saveConfig, getChannel, DCsend, getGuild, getEmoji, InvalidPlayer, getRole, getMember, gxpDB, getUser, membersDB, MCsend, getSkyblock } from '../../utils/utils.js';
import { schedule } from 'node-cron';
import { dcReady } from '../../modules/bridge.js';

export let DCserver;

export default {
	name: Events.ClientReady,

	async execute(client) {
		console.cyan(`${client.user.username} is online!`);

		await createLogsChannel(client);
		DCsend(config.logs.bot.channelID, [{ embed: [{ desc: `**${client.user.username}** is online!` }]} ]);

		await initEmojis(client);

		let guild;
		if (config.ign) {
			try {
				const user = await getUser(config.ign);
				guild = await getGuild.player(user.id);
			}
			catch (e) {
				if (e instanceof InvalidPlayer) return console.red('Error | Invalid player! Please enter a valid IGN in the config.');
				else return console.error(e);
			}

			if (guild) {
				config.guild.name = guild.name;
				saveConfig();
			}
		}

		client.user.setActivity(config.guild.name || DCserver.name, { type: ActivityType.Watching });

		// This is necessary to get all members of every role
		await DCserver.members.fetch();

		dcReady();

		schedule('0 0 * * *',
			async () => {
				if (config.guild.name) {
					let guild;
					try {
						guild = await getGuild.name(config.guild.name);
					}
					catch (e) {
						return console.error('Error | getGuild', e);
					}

					if (!guild) return console.error('Error | getGuild', 'Invalid Guild!');

					await logGXP(guild);
					await syncMembers(guild);
					await updateStatsChannels(guild);
				}
			},
			{
				timezone: 'America/Los_Angeles'
			}
		);
	}
};

async function createLogsChannel(client) {
	if (!config.logs.channelID) {
		if (client.guilds.cache.size === 1) {
			const guild = client.guilds.cache.first();
			const channel = await guild.channels.create({
				name: 'logs',
				type: 0,
				permissionOverwrites: [
					{
						id: guild.roles.everyone.id,
						deny: PermissionFlagsBits.ViewChannel
					}
				]
			});
			config.logs.channelID = channel.id;
			saveConfig();
		}
		else if (client.guilds.cache.size > 1) {
			return console.red('ERROR: The bot is in multiple Discord servers! Please specify a logs channel in the config.');
		}
		else if (client.guilds.cache.size === 0) {
			return console.red('ERROR: The bot is not in any Discord servers!');
		}
	}

	const logsChannel = getChannel(config.logs.channelID);
	if (!getChannel(config.logs.bot.channelID)) {
		const channel = await logsChannel.threads.create({ name: 'Bot' });
		config.logs.bot.channelID = channel.id;
		saveConfig();
	}
	if (config.minecraft.console.enabled && !getChannel(config.minecraft.console.channelID)) {
		const channel = await logsChannel.threads.create({ name: 'Console' });
		config.minecraft.console.channelID = channel.id;
		saveConfig();
	}

	DCserver = logsChannel.guild;
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
		return console.error('Error | Emojis', e);
	}
}

async function logGXP(guild) {
	if (!config.guild.logGXP) return;

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
		await gxpDB.bulkWrite(write);
	}
	catch(e) {
		return console.error('! logGXP', e);
	}

	DCsend(config.logs.bot.channelID, [{ embed: [{ desc: `### GXP Logger\nGXP has been logged for ${guild.members.length} members.` }], timestamp: 'f' }]);
}

async function syncMembers(guild) {
	DCsend(config.logs.bot.channelID, [{ embed: [{ desc: '**Syncing members...**' }], timestamp: 'f' }]);

	const members = [];

	const whyareyourranksnotsortedhypixel = guild.ranks.sort((a, b) => a.priority - b.priority);

	const guildRanks = config.guild.ranks.roles.map((rank, i) => ({
		name: whyareyourranksnotsortedhypixel[i].name,
		roleID: rank.roleID,
		level: Number(rank.level)
	})).filter(r => !isNaN(r.level));

	if (config.guild.ranks.autoRank || config.customRoles.skyblockLevel.enabled) {
		console.log('Fetching members...');
		let i = 0;

		for (const member of guild.members) {
			i++;

			const user = await getUser(member.uuid);
			const player = await getSkyblock(member.uuid);

			const rankOld = member.rank;
			let rankNew = guildRanks[0].name;

			if (!guildRanks.find(r => r.name === rankOld)) {
				rankNew = rankOld;
			}
			else {
				for (const rank of guildRanks) {
					if (player.level >= rank.level) rankNew = rank.name;
				}
			}

			members.push({ id: user.id, ign: user.ign, level: player.level, rankOld, rankNew });

			console.log(`Fetching members: ${i}/${guild.members.length}`);
			await new Promise(resolve => setTimeout(resolve, 12000));
		}

		console.log('Fetching complete.');
	}

	console.log(members);

	if (config.guild.ranks.autoRank) {
		for (const member of members) {
			if (member.rankOld === member.rankNew) continue;

			MCsend.raw(`/g setrank ${member.ign} ${member.rankNew}`);
			DCsend(config.logs.bot.channelID, [{ embed: [{ desc: `Assigned **${member.rankNew}** rank to **${member.ign}**` }] }]);
		}
	}

	if (config.autoRoles) {
		const plus = await getEmoji('plus');
		const minus = await getEmoji('minus');

		let guildRole;
		if (config.guild.role.enabled) {
			guildRole = getRole(config.guild.role.roleID);
			if (!guildRole) return console.error('! Guild Role', 'Invalid guild role ID!');

			for (const [dcid, member] of guildRole.members) {
				const data = await membersDB.findOne({ dcid });

				if (!data || !members.some(m => m.id === data.uuid)) {
					await member.roles.remove(guildRole);

					DCsend(config.logs.bot.channelID, [{ embed: [{ desc: `${member}\n\n${minus} ${guildRole}` }] }], { mentions: false });
				}
			}
		}

		for (const member of members) {
			const addedRoles = [];
			const removedRoles = [];

			const data = await membersDB.findOne({ uuid: member.id });
			if (!data) continue;

			let DCmember;
			try {
				DCmember = getMember(data.dcid);
				if (!DCmember) continue; // Outdated dcid in membersDB
			}
			catch (e) {
				if (e.code === 10007) continue; // Member is not in the server
				else return console.error('Error | Sync Members', e);
			}

			if (config.guild.role.enabled && !DCmember.roles.cache.has(guildRole.id)) {
				await DCmember.roles.add(guildRole);
				addedRoles.push(guildRole);
			}

			if (config.guild.ranks.enabled) {
				for (const rank of guildRanks) {
					const role = getRole(rank.roleID);
					if (member.rankNew !== rank.name && DCmember.roles.cache.has(role.id)) {
						await DCmember.roles.remove(role);
						removedRoles.push(role);
					}
				}

				if (guildRanks.find(r => r.name === member.rankNew)) {
					const role = getRole(guildRanks.find(r => r.name === member.rankNew).roleID);
					if (!role) return console.error('! Guild Ranks', `Invalid role ID for rank ${rankNew.name}!`);

					if (!DCmember.roles.cache.has(role.id)) {
						await DCmember.roles.add(role);
						addedRoles.push(role);
					}
				}
			}

			if (config.customRoles.skyblockLevel.enabled) {
				let roleNew = config.customRoles.skyblockLevel.roles[0].roleID;
				for (const role of config.customRoles.skyblockLevel.roles) {
					if (!getRole(role.roleID)) return console.error('! Custom Roles', `Invalid role ID for Skyblock level ${role.level}! (ID: ${role.roleID})`);
					if (isNaN(role.level)) return console.error('! Custom Roles', `Invalid level for Skyblock level role ID ${role.roleID}!`);

					if (member.level >= role.level) roleNew = role.roleID;
				}

				if (!DCmember.roles.cache.has(roleNew)) {
					const role = getRole(roleNew);
					await DCmember.roles.add(role);
					addedRoles.push(role);
				}

				for (const role of config.customRoles.skyblockLevel.roles) {
					const roleOld = getRole(role.roleID);
					if (roleOld.id !== roleNew && DCmember.roles.cache.has(roleOld.id)) {
						await DCmember.roles.remove(roleOld);
						removedRoles.push(roleOld);
					}
				}
			}

			if (addedRoles.length || removedRoles.length) {
				let desc = `${DCmember}`;
				if (addedRoles.length) desc += `\n\n${addedRoles.map((role) => `${plus} ${role}`).join('\n')}`;
				if (removedRoles.length) desc += `\n\n${removedRoles.map((role) => `${minus} ${role}`).join('\n')}`;

				DCsend(config.logs.bot.channelID, [{ embed: [{ desc }] }], { mentions: false });
			}
		}
	}
	DCsend(config.logs.bot.channelID, [{ embed: [{ desc: '**Sync complete!**' }], timestamp: 'f' }]);
}

async function updateStatsChannels(guild) {
	if (!config.statsChannels.enabled) return;

	try {
		if (config.statsChannels.guildLevel.enabled) {
			const channel = getChannel(config.statsChannels.guildLevel.channelID);
			if (channel) channel.setName(config.statsChannels.guildLevel.name ? config.statsChannels.guildLevel.name.replace('#level', guild.level.toFixed(1)) : `⭐ Level: ${guild.level.toFixed(1)}`);
			else console.yellow('! Stats Channels', 'Invalid stats channel ID for guild level!');
		}
		if (config.statsChannels.guildMembers.enabled) {
			const channel = getChannel(config.statsChannels.guildMembers.channelID);
			if (channel) channel.setName(config.statsChannels.guildMembers.name ? config.statsChannels.guildMembers.name.replace('#members', guild.members.length) : `😋 Members: ${guild.members.length}/125`);
			else console.yellow('! Stats Channels', 'Invalid stats channel ID for guild members!');
		}
	}
	catch (e) {
		if (e.message.includes('Missing Permissions')) return console.error('Error | Stats Channels', 'I don\'t have permission to update the stats channels!');
		else if (e.message.includes('Missing Access')) return console.error('Error | Stats Channels', 'I need the \'Connect\' channel permission to update the stats channels!');
		else return console.error('Error | Stats Channels', e);
	}

	DCsend(config.logs.bot.channelID, [{ embed: [{ desc: '### Stats Channels\nStats channels have been updated!' }], timestamp: 'f' }]);
}
