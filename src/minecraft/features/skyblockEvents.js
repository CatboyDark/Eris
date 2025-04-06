// import { createMsg, readConfig } from '../../utils/utils.js';
// import fs from 'fs';
// import schedule from 'node-schedule';
// import { discord } from '../../discord/Discord.js';

// export default async () => {
// 	const config = readConfig();
// 	if (!config.skyblockEvents.enabled) return;

// 	const events = getEvents();

// 	await initEvents(events, config);
// };

// const eventsData = JSON.parse(fs.readFileSync('./assets/events.json', 'utf8'));

// function getEvents(eventName = null) {
// 	const now = Date.now();
// 	const results = eventsData.map(event => {
// 		const thatEvent = config.skyblockEvents.events.find(e => e.name === event.name);
// 		if (!thatEvent.sendNotif && !thatEvent.updateMessage) return null;

// 		const instance = event.instance * 1000;
// 		const timeSince = now - instance;
// 		const timeTil = event.interval * 1000 - (timeSince % (event.interval * 1000));
// 		const nextEvent = now + timeTil - (event.notify * 1000);
// 		const notifTime = nextEvent - (event.notify * 1000);
// 		return {
// 			name: event.name,
// 			notifTime,
// 			duration: event.duration * 1000
// 		};
// 	}).filter(Boolean);
// 	return eventName ? results.find(e => e.name === eventName) : results;
// }

// async function initEvents(events, config) {
// 	const channel = discord.channels.cache.get(config.skyblockEvents.channel);
// 	const message = await channel.messages.fetch(config.skyblockEvents.message);

// 	for (const event in events) {
// 		schedule.scheduleJob(new Date(event.notifTime), async () => {
// 			const thatEvent = config.skyblockEvents.events.find(e => e.name === event.name);
// 			if (thatEvent.sendNotif) {
// 				console.log(`[EVENT] ${event}: ${thatEvent.notify !== 0 ? `in ${thatEvent.notify / 60} mins` : 'Now'}!`);
// 			}
// 			if (thatEvent.updateMessage) {
// 				const result = [];
// 				let eventDesc;
// 				if (event.isActive) {
// 					eventDesc = '**NOW!**';
// 				}
// 				else {
// 					const eventTime = new Date(event.nextInstance);
// 					eventDesc = `<t:${Math.floor(eventTime.getTime() / 1000)}:R>`;
// 				}
// 				result.push(`### ${event.name} - ${eventDesc}`);

// 				await message.edit({ embeds: [createMsg({ desc: `# Events\n${result.join('\n')}` })] });
// 			}

// 			const nextEvent = getEvents(event.name);
// 			initEvents(nextEvent, config);
// 		});
// 	}
// }
