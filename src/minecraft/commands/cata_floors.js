import { getSkyblock, getUser, InvalidPlayer } from '../../utils/utils.js';

const floors = ['f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'];

const commands = [];

for (const floor of floors) {
	const command = {
		name: floor,
		prefix: true,
		channels: ['guild', 'officer', 'party', 'dm'],
		options: ['ign', 'profile'],

		async execute(message) {
			let user;
			if (message.options.ign) {
				try {
					user = await getUser(message.options.ign);
				}
				catch (e) {
					if (e instanceof InvalidPlayer) return message.reply(`${message.options.ign}: Invalid player!`);
				}
			}
			else {
				user = await getUser(message.sender);
			}

			const player = await getSkyblock(user.id, message.options.profile);
			const floors = player.cata.floors;

			if (!floors[floor].runs) return message.reply(`${user.ign} has no ${floor.toUpperCase()} completions on ${profileName}!`);

			message.reply(`${user.ign}'s ${floor.toUpperCase()}: Runs: ${floors[floor].runs} | Total Collection: ${floors[floor].collection} | PB: ${floors[floor].score} ${floors[floor].time}`);
		}
	};

	commands.push(command);
}

export default commands;
