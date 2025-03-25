import { getUser } from '../../helper.js';
import auth from '../../../auth.json' with { type: 'json' };
import fs from 'fs';

export default {
	name: 'forge',
	prefix: true,
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['ign'],

	async execute(message) {
		const user = message.options.ign ? message.options.ign : message.sender;
		const userData = await getUser(user);
		if (!userData) return message.reply('Invalid player!');
		const { id, name } = userData;

		const response = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?key=${auth.hypixelAPI}&uuid=${id}`);
		const data = await response.json();

		const profile = data.profiles.find(profile => profile.selected);
		const player = profile.members[id];

		const processes = player.forge.forge_processes.forge_1;
		if (Object.keys(processes).length === 0) {
			return message.reply(`${name}: Empty Forge!`);
		}

		const quickForge = player.mining_core.nodes.forge_time;

		const items = Object.values(processes).map(process => ({
			id: process.id,
			timeStart: process.startTime
		}));

		const forgeMap = JSON.parse(fs.readFileSync('./assets/forge.json', 'utf8')); // Credit: https://github.com/DuckySoLucky/hypixel-discord-chat-bridge
		const list = [];

		for (const item of items) {
			const itemInfo = forgeMap.items[item.id];

			if (itemInfo) {
				let duration = itemInfo.duration;
				if (quickForge) {
					duration *= forgeMap.quickForgeMultiplier[quickForge];
				}

				const timeStart = item.timeStart;
				const timeFinish = timeStart + duration;

				const now = Date.now();
				const timeRemaining = Math.max(0, timeFinish - now);

				const remainingHours = Math.floor(timeRemaining / (60 * 60 * 1000));
				const remainingMinutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));

				let time;
				if (timeRemaining <= 0) {
					time = 'Ready!';
				}
				else if (remainingHours > 0) {
					time = `${remainingHours}h${remainingMinutes}m`;
				}
				else {
					time = `${remainingMinutes}m`;
				}

				list.push(`${itemInfo.name}: ${time}`);
			}
			else {
				list.push(`${item.id}: Unknown`);
			}
		}

		message.reply(`${name}'s Forge: ${list.join(' | ')}`);
	}
};
