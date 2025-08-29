import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { config, createMsg, read, saveConfig, write } from '../../../utils/utils.js';

const parser = new Parser();
// const allForums = 'https://hypixel.net/forums/-/index.rss';
const skyblockGeneralDiscussion = 'https://hypixel.net/forums/skyblock-general-discussion.157/index.rss';
const skyblockPatchNotes = 'https://hypixel.net/forums/skyblock-patch-notes.158/index.rss';
const skyblockAlphaNetwork = 'https://hypixel.net/skyblock-alpha/index.rss';

export async function getFeed(url, channel, role) {
	if (!config.sbNews.enabled) return;

	const feed = await parser.parseURL(url);
	const cache = read('.cache/bot/rss.json');

	const category =
		url === skyblockGeneralDiscussion ? 'Skyblock General Discussions' :
		url === skyblockPatchNotes ? 'SkyBlock Patch Notes' :
		url === skyblockAlphaNetwork ? 'Skyblock Alpha Network' :
		'Miscellaneous';

	if (!cache[category]) cache[category] = [];

	const newItems = feed.items
		.reverse()
		.filter(item => {
			if (cache[category].includes(item.guid)) return false;
			if (category === 'Skyblock Alpha Network' && item.creator !== 'Hypixel Team') return false;
			return true;
		});

	for (const item of newItems) {
		const $ = cheerio.load(item['content:encoded']);

		const parts = [];

		if (role) {
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

		await channel.send(createMsg(parts));
	}

	cache[category] = feed.items.map(item => item.guid);
	write('.cache/bot/rss.json', cache);
}

export default {
	name: 'setnews',
	desc: 'Setup Hypixel Skyblock news channel',
	options: [
		{ type: 'role', name: 'role', desc: 'Enter a role to ping for updates' },
		{ type: 'channel', name: 'channel', desc: 'Enter a channel' }
	],
	permissions: 0,

	async execute(interaction) {
		const channel = interaction.options.getChannel('channel') ?? interaction.channel;
		const role = interaction.options.getRole('role') ?? null;

		config.sbNews.enabled = true;
		config.sbNews.channelID = channel.id;
		config.sbNews.roleID = role ? role.id : null;
		saveConfig();

		const desc = role ? `**Skyblock news channel has been set to <#${channel.id}> and will ping** ${role}` : `**Skyblock news channel has been set to <#${channel.id}>**`;
		interaction.reply(createMsg([{ embed: [{ desc }] }], { ephemeral: true }));

		await getFeed(skyblockPatchNotes, channel, role);
		await getFeed(skyblockAlphaNetwork, channel, role);
	}
};
