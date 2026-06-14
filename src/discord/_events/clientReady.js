import fs from 'fs';
import { Events, PermissionFlagsBits } from 'discord.js';
import { Config, getChannel, DCsend, getGuild, getEmoji, InvalidPlayer, getRole, getMember, gxpDB, getUserByUUID, MCsend, getSkyblock, LinkedUsers, updateRoles, getUserByIGN, read, createMsg } from '../../utils/utils.js';
import { schedule } from 'node-cron';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';

export let DCserver;

let dcResolve;
export const dcReady = new Promise((res) => { dcResolve = res; });

export default {
	name: Events.ClientReady,

	async execute(client) {
		console.cyan(`${client.user.username} is online!`);

		await createLogsChannel(client);
		DCsend(Config.logs.bot.channelID, [{ embed: [{ desc: `**${client.user.username}** is online!` }]} ]);

		await initEmojis(client);

		let guild;
		if (Config.ign) {
			try {
				const user = await getUserByIGN(Config.ign);
				guild = await getGuild.player(user.id);
			}
			catch (e) {
				if (e instanceof InvalidPlayer) return console.red('Error | Invalid player! Please enter a valid IGN in the config.');
				else return console.error(e);
			}

			if (guild) {
				Config.guild.name = guild.name;
				Config.write();
			}
		}

		// client.user.setActivity(Config.guild.name || DCserver.name, { type: ActivityType.Watching });

		// This is necessary to get all members of every role
		await DCserver.members.fetch();

		dcResolve();

		await sbNews();
		// await syncMembers(guild);
		schedule('0 0 * * *',
			async () => {
				if (Config.guild.name) {
					let guild;
					try {
						guild = await getGuild.name(Config.guild.name);
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
	if (!Config.logs.channelID) {
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
			Config.logs.channelID = channel.id;
			Config.write();
		}
		else if (client.guilds.cache.size > 1) {
			return console.red('ERROR: The bot is in multiple Discord servers! Please specify a logs channel in the config.');
		}
		else if (client.guilds.cache.size === 0) {
			return console.red('ERROR: The bot is not in any Discord servers!');
		}
	}

	const logsChannel = getChannel(Config.logs.channelID);
	if (!getChannel(Config.logs.bot.channelID)) {
		const channel = await logsChannel.threads.create({ name: 'Bot' });
		Config.logs.bot.channelID = channel.id;
		Config.write();
	}
	if (Config.minecraft.console.enabled && !getChannel(Config.minecraft.console.channelID)) {
		const channel = await logsChannel.threads.create({ name: 'Console' });
		Config.minecraft.console.channelID = channel.id;
		Config.write();
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
	if (!Config.guild.logGXP) return;

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

	DCsend(Config.logs.bot.channelID, [{ embed: [{ desc: `### GXP Logger\nGXP has been logged for ${guild.members.length} members.` }], timestamp: 'f' }]);
}

async function syncMembers(guild) {
	if (!Config.guild.ranks.autoRank && !Config.autoRoles) return;

	DCsend(Config.logs.bot.channelID, [{ embed: [{ desc: '**Syncing members...**' }], timestamp: 'f' }]);

	const members = [];

	const whyareyourranksnotsortedhypixel = guild.ranks.sort((a, b) => a.priority - b.priority);

	const guildRanks = Config.guild.ranks.roles.map((rank, i) => ({
		name: whyareyourranksnotsortedhypixel[i].name,
		roleID: rank.roleID,
		level: Number(rank.level)
	})).filter(r => !isNaN(r.level));

	if (Config.guild.ranks.autoRank || Config.customRoles.skyblockLevel.enabled) {
		console.magenta('Fetching members...');
		let i = 0;

		for (const member of guild.members) {
			i++;

			console.log(member);
			const user = await getUserByUUID(member.uuid);
			const player = await getSkyblock(member.uuid, { profile: 'highest' });

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

			members.push({ uuid: user.id, ign: user.ign, level: player.level, rankOld, rankNew });

			console.magenta(`Fetching members: ${i}/${guild.members.length}`);
			// await new Promise(resolve => setTimeout(resolve, 12000));
		}

		console.magenta('Fetching complete.');
	}

	if (Config.guild.ranks.autoRank) {
		for (const member of members) {
			if (member.rankOld === member.rankNew) continue;

			MCsend.raw(`/g setrank ${member.ign} ${member.rankNew}`);
			DCsend(Config.logs.bot.channelID,
				[{ embed: [{ desc: `Assigned **${member.rankNew}** rank to **${member.ign}**` }] }]
			);
		}
	}

	if (Config.autoRoles) {
		const plus = await getEmoji('plus');
		const minus = await getEmoji('minus');

		let guildRole;
		if (Config.guild.role.enabled) {
			guildRole = getRole(Config.guild.role.roleID);
			if (!guildRole) return console.error('! Guild Role', 'Invalid guild role ID!');

			for (const [dcid, member] of guildRole.members) {
					const user = LinkedUsers.find(u => u.dcid === dcid);

					if (!user || !members.some(m => m.uuid === user.uuid)) {
						await member.roles.remove(guildRole);

					DCsend(Config.logs.bot.channelID,
						[
							{ embed: [{ desc: `${member}\n\n${minus} ${guildRole}` }] }
						],
						{ mentions: false }
					);
				}
			}
		}

		for (const member of members) {
			const addedRoles = [];
			const removedRoles = [];

			const user = LinkedUsers.find(u => u.uuid === member.uuid);
			if (!user) continue;

			let DCmember;
			try {
				DCmember = getMember(user.dcid);
			}
			catch (e) {
				if (e.code === 10007) continue; // Member is not in the server
				else return console.error('Error | Sync Members', e);
			}

			console.log(user);
			const { add, remove } = await updateRoles(user.uuid);

			for (const roleID of add) {
				await DCmember.roles.add(roleID);
				addedRoles.push(roleID);
			}
			for (const roleID of remove) {
				await DCmember.roles.remove(roleID);
				removedRoles.push(roleID);
			}

			if (addedRoles.length || removedRoles.length) {
				let desc = `${DCmember}`;
			if (addedRoles.length) desc += `\n\n${addedRoles.map((role) => `${plus} <@&${role}>`).join('\n')}`;
				if (removedRoles.length) desc += `\n\n${removedRoles.map((role) => `${minus} <@&${role}>`).join('\n')}`;

				DCsend(Config.logs.bot.channelID, [{ embed: [{ desc }] }], { mentions: false });
			}
		}
	}
	DCsend(Config.logs.bot.channelID, [{ embed: [{ desc: '**Sync complete!**' }], timestamp: 'f' }]);
}

async function updateStatsChannels(guild) {
	if (!Config.statsChannels.enabled) return;

	try {
		if (Config.statsChannels.guildLevel.enabled) {
			const channel = getChannel(Config.statsChannels.guildLevel.channelID);
			if (channel) channel.setName(Config.statsChannels.guildLevel.name ? Config.statsChannels.guildLevel.name.replace('#level', guild.level.toFixed(1)) : `⭐ Level: ${guild.level.toFixed(1)}`);
			else console.yellow('! Stats Channels', 'Invalid stats channel ID for guild level!');
		}
		if (Config.statsChannels.guildMembers.enabled) {
			const channel = getChannel(Config.statsChannels.guildMembers.channelID);
			if (channel) channel.setName(Config.statsChannels.guildMembers.name ? Config.statsChannels.guildMembers.name.replace('#members', guild.members.length) : `😋 Members: ${guild.members.length}/125`);
			else console.yellow('! Stats Channels', 'Invalid stats channel ID for guild members!');
		}
	}
	catch (e) {
		if (e.message.includes('Missing Permissions')) return console.error('Error | Stats Channels', 'I don\'t have permission to update the stats channels!');
		else if (e.message.includes('Missing Access')) return console.error('Error | Stats Channels', 'I need the \'Connect\' channel permission to update the stats channels!');
		else return console.error('Error | Stats Channels', e);
	}

	DCsend(Config.logs.bot.channelID, [{ embed: [{ desc: '### Stats Channels\nStats channels have been updated!' }], timestamp: 'f' }]);
}

const rssChannels = {
	// 'allForums': 'https://hypixel.net/forums/-/index.rss',
	skyblockGeneralDiscussion: 'https://hypixel.net/forums/skyblock-general-discussion.157/index.rss',
	skyblockAnnouncements: 'https://hypixel.net/forums/news-and-announcements.4/index.rss',
	skyblockPatchNotes: 'https://hypixel.net/forums/skyblock-patch-notes.158/index.rss',
	skyblockAlphaNetwork: 'https://hypixel.net/skyblock-alpha/index.rss'
};

const newsChannel = Config.sbNews.channelID;
const newsRole = Config.sbNews.roleID;

const parser = new Parser();

const staff = read('assets/hypixelStaff.jsonc');

async function getFeed(url, c, r) {
	if (!Config.sbNews.enabled) return;

	let feed
	try {
		feed = await parser.parseURL(url);
	}
	catch (e) {
		console.log('meow')
		console.log(e)
	}
	const cache = read('.cache/bot/rss.json');

	const category =
		url === rssChannels.skyblockGeneralDiscussion ? 'skyblockGeneralDiscussion' :
		url === rssChannels.skyblockAnnouncements ? 'skyblockAnnouncements' :
		url === rssChannels.skyblockPatchNotes ? 'skyblockPatchNotes' :
		url === rssChannels.skyblockAlphaNetwork ? 'skyblockAlphaNetwork' :
		null;

	if (!cache[category]) {
		cache[category] = Math.max(...feed.items.map(item => +item.guid));
		cache.write();

		return;
	}

	const newItems = feed.items
		.reverse()
		.filter(item => {
			if (+item.guid <= +cache[category]) return false;
			if (category === 'skyblockAnnouncements' && !item.title.toLowerCase().includes('skyblock')) return false;
			if (category === 'skyblockAlphaNetwork' && !Object.values(staff).includes(item.creator)) return false;
			if (category === 'skyblockGeneralDiscussion' && !Object.values(staff).includes(item.creator)) return false;
			return true;
		});

	for (const item of newItems) {
		const $ = cheerio.load(item['content:encoded']);

		const parts = [];

		if (r) {
			const role = getRole(r);
			parts.push({ desc: `-# ${role}` });
		}

		parts.push(
			{
				color: 'E7871B',
				embed: [
					{
						desc: `### ${item.title}\n*${item.categories.map(c => c._)} - ${item.creator}*\n\n${$('.bbWrapper').text()}`,
						icon: { url: 'https://avatars.githubusercontent.com/u/3840546?s=280&v=4' }
					}
				]
			},
			[{ label: 'View Thread', url: item.link }]
		);

		const channel = getChannel(c);

		await channel.send(createMsg(parts));
		if (Config.minecraft.enabled) MCsend({ channel: 'guild', content: `${item.title} ${item.link}` });
	}

	if (newItems.length) {
		cache[category] = Math.max(...newItems.map(item => +item.guid));
		cache.write();
	}
}

async function sbNews() {
	setInterval(async () => {
		await getFeed(rssChannels.skyblockAnnouncements, newsChannel, newsRole);
		await getFeed(rssChannels.skyblockPatchNotes, newsChannel, newsRole);
		await getFeed(rssChannels.skyblockAlphaNetwork, newsChannel, newsRole);
		await getFeed(rssChannels.skyblockGeneralDiscussion, newsChannel, newsRole);
	}, 60 * 1000);
}
