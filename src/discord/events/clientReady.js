import fs from 'fs';
import { ActivityType, Events } from 'discord.js';
import { config, saveConfig, getChannel, DCsend, getGuild, getEmoji } from '../../utils/utils.js';
import { getMongo, gxpSchema } from '../../mongo/schemas.js';
import { schedule } from 'node-cron';

export default {
	name: Events.ClientReady,

	async execute(client) {
		console.cyan(`${client.user.username} is online!`);

		await createLogsChannel(client);
		DCsend(config.logs.bot.channel, [{ embed: [{
			desc: `**${client.user.username}** is online!`
		}]} ]);

		await initEmojis(client);

		if (config.ign) {
			let guild;
			try {
				guild = await getGuild.player(config.ign);
			}
			catch (e) {
				if (e.message.includes('Invalid Player')) return console.red('ERROR: Invalid Player! Please enter a valid IGN in the config.');
			}

			if (guild) {
				config.guild.name = guild.name;
				saveConfig();
			}
		}

		client.user.setActivity(config.guild.name ?? getChannel(config.logs.channel).guild.name, { type: ActivityType.Watching });

		schedule('0 0 * * *',
			async () => {
				if (config.guild.name) {
					await logGXP();
					await syncRoles();
					await updateStatsChannels();
				}
			},
			{
				timezone: 'America/Los_Angeles'
			}
		);
	}
};

let guild;
try {
	guild = await getGuild.name(config.guild.name);
}
catch (e) {
	console.error('! getGuild >', e);
}

async function createLogsChannel(client) {
	if (!config.logs.channel) {
		if (client.guilds.cache.size > 1) {
			return console.red('ERROR: The bot is in multiple Discord servers. Please specify a logs channel in the config.');
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
		console.error('! Emojis >', e);
	}
}

async function logGXP() {
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
		console.error('! logGXP >', e);
	}
}

async function syncRoles() {
	const plus = await getEmoji('plus');
	const minus = await getEmoji('minus');


}
