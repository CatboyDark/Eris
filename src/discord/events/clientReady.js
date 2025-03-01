import { execSync } from 'child_process';
import { ActivityType, Events, Team } from 'discord.js';
import fs from 'fs';
import { schedule } from 'node-cron';
import display from '../../display.js';
import { createMsg, createRow, getGuild, readConfig, writeConfig } from '../../helper.js';
import { getMongo, membersSchema } from '../../mongo/schemas.js';

export default
{
	name: Events.ClientReady,

	async execute(client) {
		const config = readConfig();
		const logsChannel = client.channels.cache.get(config.logs.channel);
		let botLogs = logsChannel.threads.cache.find(x => x.name === 'Bot');
		if (!botLogs) {
			botLogs = await logsChannel.threads.create({ name: 'Bot' });
		}
		config.logs.bot = botLogs.id;
		writeConfig(config);

		await botLogs.send({ embeds: [createMsg({ desc: `**${client.user.username} is online!**` })] });
		client.user.setActivity(config.guild.name ?? logsChannel?.guild.name, { type: ActivityType.Watching });
		display.c(`${client.user.username} is online!`);

		await initEmojis(client);

		updateCheck(client);
		schedule('0 */6 * * *', // Once every 6 hours
			async () => updateCheck(client)
		);

		schedule( '1 22 * * *', // 10:01 PST every day
			async () => {
				const config = readConfig();
				await logGXP(client, config);
				// await syncRoles(client, config);
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

async function updateCheck(client) {
	const config = readConfig();
	const app = await client.application.fetch();
	const logs = client.channels.cache.get(config.logs.bot);

	let branch;
    let localHash;
    let remoteHash;
	let commitMessage;

	try {
		branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
		localHash = execSync('git rev-parse HEAD').toString().trim();
		remoteHash = execSync(`git ls-remote origin ${branch}`).toString().split('\t')[0].trim();
		commitMessage = execSync('git log -1 --pretty=%B').toString().trim();
	}
	catch (e) {
		display.r(`UpdateCheck > ${e}`);
		logs.send({
			content: `<@${app.owner instanceof Team ? app.owner.ownerId : app.owner.id}>`,
			embeds: [createMsg({ title: config.guild.name ?? logs.guild.name, color: 'Red', desc: '**Error checking for updates!**' })]
		});
	}

	if (localHash === remoteHash) return;

	display.y('Update Available! Run "git pull" to update!');
	logs.send({
		content: `<@${app.owner instanceof Team ? app.owner.ownerId : app.owner.id}>`,
		embeds: [createMsg({ title: 'Update available!', desc: `\`${commitMessage}\`` })],
		components: [createRow([{ id: 'restart', label: 'Update', color: 'Green' }])]
	});
}

async function logGXP(client, config) {
	try {
		const guild = await getGuild('guild', config.guild.name);
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

		const bulk = [...data].map(([date, entries]) => ({
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

	const logs = client.channels.cache.get(config.logs.bot);
	await logs.send({ embeds: [createMsg({ title: config.guild.name ?? logs.guild.name, desc: '**GXP has been logged!**' })] });
}

// async function syncRoles(client, config) {
// 	const guild = await getGuild('guild', config.guild.name);
// 	const guildMembers = guild.members;

// 	const discord = client.channels.cache.get(config.logs.channel).guild;
// 	const guildRole = discord.roles.cache.get(config.guild.role.role);

// 	const members = getMongo('Eris', 'members', membersSchema);
// 	const data = await members.find({});

// 	for (const [id, member] of guildRole.members) {
// 		const entry = data.find(data => data.dcid === id);
// 		if (entry) {
// 			const inGuild = guildMembers.some(gameMember => gameMember.uuid === entry.uuid);
// 			if (!inGuild) {
// 				await member.roles.remove(guildRole);
// 			}
// 		}
// 		else {
// 			await member.roles.remove(guildRole);
// 		}
// 	}

// 	for (const member of guildMembers) {
// 		const entry = data.find(data => data.uuid === member.uuid);
// 		if (entry) {
// 			const member = discord.members.cache.get(entry.dcid);
// 			if (member && !member.roles.cache.has(guildRole.id)) {
// 				await member.roles.add(guildRole);
// 			}
// 		}
// 	}

// 	const logs = client.channels.cache.get(config.logs.bot);
// 	logs.send({ embeds: [createMsg({ title: config.guild.name ?? logs.guild.name, desc: '**Guild members have been synced!**' })]
// 	});
// }
