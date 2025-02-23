import { execSync } from 'child_process';
import { ActivityType, Events, Team } from 'discord.js';
import fs from 'fs';
import { schedule } from 'node-cron';
import display from '../../display.js';
import { createMsg, createRow, readConfig } from '../../helper.js';

async function updateCheck(client) {
	const config = readConfig();
	const logsChannel = client.channels.cache.get(config.logsChannel);

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
	catch (error) {
		display.r(`UpdateCheck > ${error}`);
		logsChannel?.send({ embeds: [createMsg({ title: config.guild ?? logsChannel.guild.name, color: 'Red', desc: '**Error checking for updates!**' })] });
	}

	if (localHash === remoteHash) return;

	display.y('Update Available! Run "git pull" to update!');
	const app = await client.application.fetch();
	logsChannel?.send({
		content: `<@${app.owner instanceof Team ? app.owner.ownerId : app.owner.id}>`,
		embeds: [createMsg({ title: 'Update available!', desc: `\`${commitMessage}\`` })],
		components: [createRow([{ id: 'update', label: 'Update', color: 'Green' }])]
	});
}

export default
{
	name: Events.ClientReady,

	async execute(client) {
		const config = readConfig();
		const logsChannel = client.channels.cache.get(config.logsChannel);

		// Emojis
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
					await emoji.edit({ attachment: `./assets/emojis/${emojiFile}` });
				}
				else {
					await app.emojis.create({ attachment: `./assets/emojis/${emojiFile}`, name: emojiName });
				}
			}
		}
		catch (e) {
			display.r(`Emoji > ${e.message}`);
		}

		//
		logsChannel?.send({ embeds: [createMsg({ desc: '**Bot is Online!**' })] });
		client.user.setActivity(config.guild ?? logsChannel?.guild.name, { type: ActivityType.Watching });

		display.c(`${client.user.username} is online!`);

		// Updater
		updateCheck(client);
		schedule('0 */6 * * *', // Once every 6 hours
			async () => updateCheck(client)
		);

		// GXP Logger
		// schedule( '1 22 * * *', // 00:01 PST every day
		// 	async () => {
		// 		try {
		// 			const guild = await getGuild('guild', config.guild);
		// 			const today = getToday();

		// 			for (const { uuid, expHistory } of guild.members) {
		// 				const entries = expHistory
		// 					.filter(({ day }) => formatDate(day) !== today)
		// 					.map(({ day, exp }) => ({
		// 						date: formatDate(day),
		// 						gxp: exp
		// 					}));

		// 				for (const entry of entries) {
		// 					const updateResult = await GXP.updateOne(
		// 						{ uuid, 'entries.date': entry.date },
		// 						{ $set: { 'entries.$.gxp': entry.gxp } }
		// 					);

		// 					if (!updateResult.matchedCount) {
		// 						await GXP.updateOne(
		// 							{ uuid },
		// 							{ $push: { entries: { $each: [entry], $sort: { date: -1 }}}},
		// 							{ upsert: true }
		// 						);
		// 					}
		// 				}
		// 			}
		// 		}
		// 		catch (error) {
		// 			console.error('Error logging GXP:', error);
		// 		}
		// 		await client.channels.cache.get(config.logsChannel)?.send({ embeds: [createMsg({ title: config.guild, desc: '**Daily GXP database has been updated!**' })] });
		// 	},
		// 	{ timezone: 'America/Los_Angeles' }
		// );
	}
};

