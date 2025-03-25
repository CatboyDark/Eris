import { execSync } from 'child_process';
import { ActivityType, Events, Team } from 'discord.js';
import fs from 'fs';
import { schedule } from 'node-cron';
import display from '../../display.js';
import { createMsg, createRow, getEmoji, getGuild, readConfig, writeConfig } from '../../helper.js';
import { getMongo, gxpSchema, membersSchema } from '../../mongo/schemas.js';

export default
{
	name: Events.ClientReady,

	async execute(client) {
		const config = readConfig();
		const logsChannel = client.channels.cache.get(config.logs.channel);
		let botLogs = logsChannel.threads.cache.find(x => x.name === 'Bot');
		if (!botLogs) {
			botLogs = await logsChannel.threads.create({ name: 'Bot' });
			config.logs.bot = botLogs.id;
			writeConfig(config);
		}

		await client.channels.cache.get(config.logs.bot).send({ embeds: [createMsg({ desc: `**${client.user.displayName} is online!**` })] });
		client.user.setActivity(config.guild.name ?? logsChannel?.guild.name, { type: ActivityType.Watching });
		display.c(`${client.user.displayName} is online!`);

		await initEmojis(client);

		updateCheck(client, config);
		schedule('0 */6 * * *', // Once every 6 hours
			async () => updateCheck(client, config)
		);

		schedule( '1 22 * * *', // 12:01 CST every day
			async () => {
				const guild = await getGuild.name(config.guild.name);
				const logs = client.channels.cache.get(config.logs.bot);

				await logGXP(config, logs, guild);
				await syncRoles(client, config, logs, guild);
				await updateStatsChannels(client, config, logs, guild);
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
		console.log(e);
	}
}

async function updateCheck(client, config) {
	const app = await client.application.fetch();
	const logs = client.channels.cache.get(config.logs.bot);

	let localHash;
	let latestHash;

	try {
		localHash = execSync('git rev-parse HEAD').toString().trim();

		execSync('git fetch origin');
		const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
		latestHash = execSync(`git rev-parse origin/${branch}`).toString().trim();
	}
	catch (e) {
		display.r(`UpdateCheck > ${e}`);
		return logs.send({
			content: `<@${app.owner instanceof Team ? app.owner.ownerId : app.owner.id}>`,
			embeds: [createMsg({ title: config.guild.name ?? logs.guild.name, color: 'Red', desc: '**Error checking for updates!**' })]
		});
	}

	if (!config.hash) {
		config.hash = localHash;
		writeConfig(config);
	}

	if (config.hash === latestHash) return;

	const commitMessage = execSync('git log -1 --pretty=%B').toString().trim();

	display.y('Update Available! Run "git pull" to update!');
	logs.send({
		content: `<@${app.owner instanceof Team ? app.owner.ownerId : app.owner.id}>`,
		embeds: [createMsg({ desc: `**Update Available!**\n\`\`\`${commitMessage}\`\`\`` })],
		components: [createRow([{ id: 'restart', label: 'Update', color: 'Green' }])]
	});

	config.hash = latestHash;
	writeConfig(config);
}

async function logGXP(config, logs, guild) {
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
		display.r('GXP Logger >', e);
	}

	await logs.send({ embeds: [createMsg({ desc: '**GXP has been logged!**' })] });
}

async function syncRoles(client, config, logs, guild) {
	const plus = await getEmoji('plus');
	const minus = await getEmoji('minus');

	const guildMembers = guild.members;
	const discord = client.channels.cache.get(config.logs.channel).guild;
	const guildRole = discord.roles.cache.get(config.guild.role.role);
	const members = getMongo('Eris', 'members', membersSchema);

	const guildMemberUUIDs = new Set(guildMembers.map(member => member.uuid));

	const addedRoles = [];
	const removedRoles = [];

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

	let desc = '**Guild members have been synced!**';
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

	await logs.send({ embeds: [createMsg({ desc: desc })]
	});
}

async function updateStatsChannels(client, config, logs, guild) {
	await client.channels.cache.get(config.statsChannels.level)
		.setName(`⭐ Level: ${Number(Math.floor(guild.level.toFixed(1)))}`);
	await client.channels.cache.get(config.statsChannels.members)
		.setName(`😋 Members: ${guild.members.length}/125`);

	await logs.send({ embeds: [createMsg({ desc: '**Stats channels have been updated!**' })] });
}
