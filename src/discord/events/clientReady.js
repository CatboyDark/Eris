import { ActivityType, Events } from 'discord.js';
import fs from 'fs';
import { schedule } from 'node-cron';
import { getMongo, gxpSchema, membersSchema } from '../../mongo/schemas.js';
import { createMsg, display, Error, getChannel, getEmoji, getGuild, readConfig, writeConfig } from '../../utils/utils.js';

const config = readConfig();
const guild = await getGuild.name(config.guild.name);
let botChannel;

export default {
	name: Events.ClientReady,

	async execute(client) {
		const logsChannel = await getChannel(config.logs.channel);
		botChannel = logsChannel.threads.cache.find(x => x.name === 'Bot');
		if (!botChannel) {
			botChannel = await logsChannel.threads.create({ name: 'Bot' });
			config.logs.bot.channel = botChannel.id;
			writeConfig(config);
		}
		let consoleChannel = logsChannel.threads.cache.find(x => x.name === 'Console');
		if (!consoleChannel) {
			consoleChannel = await logsChannel.threads.create({ name: 'Console' });
			config.logs.bot.channel = consoleChannel.id;
			writeConfig(config);
		}

		await botChannel.send({ embeds: [createMsg({ desc: `**${client.user.displayName} is online!**` })] });
		client.user.setActivity(config.guild.name ?? logsChannel.guild.name, { type: ActivityType.Watching });
		display.c(`${client.user.displayName} is online!`);

		await initEmojis(client);

		// updateCheck(client, config);	
		// schedule('0 */6 * * *', // Once every 6 hours
		// 	async () => updateCheck(client, config)
		// );

		schedule( '1 22 * * *', // 12:01 CST every day
			async () => {
				await logGXP();
				await syncRoles();
				await updateStatsChannels();
			},
			{
				timezone: 'America/Los_Angeles'
			}
		);
	}
};

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
		await Error('! Emojis !', e);
	}
}

// async function updateCheck(client, config) {
// 	const app = await client.application.fetch();

// 	let localHash;
// 	let latestHash;

// 	try {
// 		execSync('git fetch origin');

// 		const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
// 		localHash = execSync('git rev-parse HEAD').toString().trim();
// 		latestHash = execSync(`git rev-parse origin/${branch}`).toString().trim();
// 	}
// 	catch (e) {
// 		await Error('UpdateCheck >', e)
// 	}

// 	if (!config.hash) {
// 		config.hash = localHash;
// 		writeConfig(config);
// 	}

// 	if (config.hash === latestHash) return;

// 	const commitMessage = execSync('git log -1 --pretty=%B').toString().trim();

// 	display.y('Update Available! Run "git pull" to update!');
// 	botLog.send({
// 		content: `<@${app.owner instanceof Team ? app.owner.ownerId : app.owner.id}>`,
// 		embeds: [createMsg({ desc: `**Update Available!**\n\`\`\`${commitMessage}\`\`\`` })],
// 		components: [createRow([{ id: 'restart', label: 'Update', color: 'Green' }])]
// 	});

// 	config.hash = latestHash;
// 	writeConfig(config);
// }

async function logGXP() {
	try {
		const db = getMongo('gxp', config.guild.name, gxpSchema);

		const data = new Map();

		for (const member of guild.members) {
			const { uuid, expHistory } = member;

			for (const { day, exp } of expHistory) {
				const date = Number(day.replace(/-/g, ''));
				const entries = data.get(date) || [];
				const existingEntry = entries.find(entry => entry.uuid === uuid);
				if (existingEntry) {
					existingEntry.gxp = exp;
				}
				else {
					entries.push({
						uuid: uuid,
						gxp: exp
					});
				}
				data.set(date, entries);
			}
		}

		const sortedData = [...data].sort(([a], [b]) => b - a);

		const bulk = sortedData.map(([date, entries]) => ({
			updateOne: {
				filter: { date },
				update: { $set: { entries } },
				upsert: true
			}
		}));

		await db.bulkWrite(bulk);

	}
	catch (e) {
		await Error('! GXP Logger !', e);
	}

	await botChannel.send({ embeds: [createMsg({ desc: '**GXP logged!**' })] });
}

async function syncRoles() {
	const plus = await getEmoji('plus');
	const minus = await getEmoji('minus');

	const guildMembers = guild.members;
	const discord = botChannel.guild;
	const guildRole = discord.roles.cache.get(config.guild.role.role);
	const members = getMongo('Eris', 'members', membersSchema);

	const guildMemberUUIDs = new Set(guildMembers.map(member => member.uuid));

	const addedRoles = [];
	const removedRoles = [];

	try {
		for (const [discordId, discordMember] of guildRole.members) {
			const linked = await members.findOne({ dcid: discordId });
			if (!linked || !guildMemberUUIDs.has(linked.uuid)) {
				discordMember.roles.remove(guildRole);
				removedRoles.push(discordMember.user.id);
			}
		}

		for (const guildMember of guildMembers) {
			const linked = await members.findOne({ uuid: guildMember.uuid });
			if (linked) {
				const discordMember = discord.members.cache.get(linked.dcid);
				if (discordMember && !discordMember.roles.cache.has(guildRole.id)) {
					discordMember.roles.add(guildRole);
					addedRoles.push(discordMember.user.id);
				}
			}
		}
	}
	catch (e) {
		if (e.message.includes('Missing Permissions')) {
			await Error('! Sync Roles !', 'I don\'t have permission to assign the Guild Member role!');
		}
		else {
			await Error('! Sync Roles !', e);
		}
	}

	let desc = '**Guild members synced!**';
	if (addedRoles.length > 0 && removedRoles.length > 0) {
		desc += `\n_ _\n${addedRoles.map((user) => `${plus} <@${user}>`).join('\n')}`;
		desc += `\n_ _\n${removedRoles.map((user) => `${minus} <@${user}>`).join('\n')}`;
	}
	else if (addedRoles.length > 0) {
		desc += `\n_ _\n${addedRoles.map((user) => `${plus} <@${user}>`).join('\n')}\n_ _`;
	}
	else if (removedRoles.length > 0) {
		desc += `\n_ _\n${removedRoles.map((user) => `${minus} <@${user}>`).join('\n')}\n_ _`;
	}

	await botChannel.send({ embeds: [createMsg({ desc: desc })] });
}

async function updateStatsChannels() {
	getChannel(config.statsChannels.level).setName(`⭐ Level: ${Number(Math.floor(guild.level.toFixed(1)))}`);
	getChannel(config.statsChannels.members).setName(`😋 Members: ${guild.members.length}/125`);

	await botChannel.send({ embeds: [createMsg({ desc: '**Stats channels updated!**' })] });
}
