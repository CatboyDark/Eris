// import { createMsg } from '../../../utils/utils.js';

// export default {
// 	name: 'purge',
// 	desc: 'Purge messages',
// 	options: [
// 		{ type: 'integer', name: 'count', desc: 'Number of messages (1-100)' },
// 		{ type: 'user', name: 'user', desc: 'Specify a user' },
// 		{ type: 'string', name: 'filter', desc: 'User OR bot messages',
// 			choices: [
// 				{ name: 'Bot Messages', value: 'bot' },
// 				{ name: 'User Messages', value: 'user' }
// 			]
// 		}
// 	],

// 	async execute(interaction) {
// 		const count = interaction.options.getInteger('count') ?? 1;
// 		const filter = interaction.options.getString('filter');

// 		if (count < 1 || count > 100) return interaction.reply(createMsg([{ color: 'Error', embed: [{ desc: '**Count must be between 1 and 100!**' }] }], { ephemeral: true }));

// 		let messages = await interaction.channel.messages.fetch({ limit: count });
// 		if (filter === 'user') messages = messages.filter((msg) => !msg.author.bot);
// 		else if (filter === 'bot') messages = messages.filter((msg) => msg.author.bot);

// 		const now = Date.now();
// 		messages = messages.filter((msg) => now - msg.createdTimestamp <= 1209600000);

// 		if (messages.size > 0) {
// 			await interaction.channel.bulkDelete(messages, true);
// 			interaction.reply(createMsg([{ embed: [{ desc: `${count === 1 ? '**Deleted a message!**' : `**Deleted ${messages.size}${filter === 'user' ? ' user' : filter === 'bot' ? ' bot' : ''} messages.**`}` }] }]), { ephemeral: true });
// 		}
// 	}
// };


// make the count not the # messages fetched, but the # messages to delete
