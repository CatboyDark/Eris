import { Config, createMessage, getChannel, readTXT } from '../../utils/utils.js';

export default [{
	id: 'ticketClose',

	async execute(interaction) {
		let messages = [];
		let checkpoint;

		while (true) {
			const options = { limit: 100 };
			if (checkpoint) options.before = checkpoint;

			const batch = await interaction.channel.messages.fetch(options);

			if (batch.size === 0) break;

			messages = messages.concat(Array.from(batch.values()));
			checkpoint = batch.last().id;
		}

		messages.reverse();

		const content = messages.map(msg => {
			const { yyyy, mm, dd, hh, min, ss } = getTime(msg.createdAt);
			return `[UTC ${yyyy}.${mm}.${dd} - ${hh}:${min}:${ss}] ${msg.member?.displayName ?? msg.author.displayName}: ${msg.content || '[embed/attachment]'}`;
		}).join('\n');

		const { yyyy, mm, dd, hh, min } = getTime(messages[0].createdAt);
		const file = readTXT(`${interaction.channel.name}_${yyyy}${mm}${dd}_${hh}${min}.log`);

		file.content = content;
		file.write();

		const channel = getChannel(Config.logs.tickets.channelID);
		await channel.send(createMessage([{ file: `${interaction.channel.name}_${yyyy}${mm}${dd}_${hh}${min}.log` }]));

		file.delete();

		await interaction.channel.delete();
	}
}];

function getTime(date) {
	const yyyy = date.getUTCFullYear();
	const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
	const dd = String(date.getUTCDate()).padStart(2, '0');
	const hh = String(date.getUTCHours()).padStart(2, '0');
	const min = String(date.getUTCMinutes()).padStart(2, '0');
	const ss = String(date.getUTCSeconds()).padStart(2, '0');

	return { yyyy, mm, dd, hh, min, ss };
}

