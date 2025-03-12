// import { createMsg, getPerms, readConfig, writeConfig } from '../../../helper.js';
// import { getEvents } from '../../../minecraft/features/skyblockEvents.js';

// export default {
// 	name: 'setevents',
// 	prefix: true,

// 	async execute(message) {
// 		const config = readConfig();
// 		const perms = getPerms(message.member);
// 		if (!perms.includes('SetEventsChannel')) return;

// 		const events = getEvents().reduce((result, event) => {
// 			const eventConfig = config.skyblockEvents.events.find(e => e.name === event.name);
// 			if (eventConfig.channelMessage) {
// 				let timeDisplay;
// 					if (event.isActive) {
// 						timeDisplay = '**NOW!**';
// 					}
// 					else {
// 						const eventTime = new Date(event.nextInstance);
// 						timeDisplay = `<t:${Math.floor(eventTime.getTime() / 1000)}:R>`;
// 					}
// 					result.push(`• **${event.name}** - ${timeDisplay}`);
// 			}
// 			return result;
// 		}, []).join('\n');

// 		const eventsMessage = await message.channel.send({ embeds: [createMsg({ desc: `### Events\n${events}` })] });

// 		await message.delete();

// 		config.skyblockEvents.message = eventsMessage.id;
// 		config.skyblockEvents.channel = eventsMessage.channel.id;
// 		writeConfig(config);
// 	}
// };
