import { MessageFlags } from 'discord.js';
import { createMsg, getPerms } from '../../../utils/utils.js';

export default
{
	name: 'purge',
	desc: 'Purge messages',
	options: [
		{ type: 'integer', name: 'count', desc: 'Number of messages (1-100)' },
		{ type: 'user', name: 'user', desc: 'Specify a user' },
		{ type: 'string', name: 'filter', desc: 'User OR bot messages',
			choices: [
				{ name: 'Bot Messages', value: 'bot' },
				{ name: 'User Messages', value: 'user' }
			]
		}
	],

	async execute(interaction) {
		const perms = getPerms(interaction.member);
		if (!perms.includes('DeleteMessages')) return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**You don\'t have permission to use this command!**' })] });

		const count = interaction.options.getInteger('count');
		const filter = interaction.options.getString('filter');

		if (count < 1) { return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: 'You must purge at least one message!' })], flags: MessageFlags.Ephemeral }); }
		if (count > 100) { return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: 'You can only purge up to 100 messages!' })], flags: MessageFlags.Ephemeral }); }

		let messages = await interaction.channel.messages.fetch({ limit: count });

		if (filter === 'user') { messages = messages.filter((msg) => !msg.author.bot); }
		if (filter === 'bot') { messages = messages.filter((msg) => msg.author.bot); }

		const now = Date.now();
		messages = messages.filter((msg) => now - msg.createdTimestamp <= 1209600000);

		if (messages.size > 0) {
			await interaction.channel.bulkDelete(messages, true);
			const success = count === 1
				? createMsg({ desc: '**Deleted a message.**' })
				: createMsg({ desc: `**Deleted ${messages.size} ${filter === 'user' ? 'user' : filter === 'bot' ? 'bot' : ''} messages.**` });
			await interaction.reply({ embeds: [success], flags: MessageFlags.Ephemeral });
		}
		else {
			await interaction.reply({ embeds: [createMsg({ color: 'Red', desc: 'You cannot purge messages older than 14 days!' })], flags: MessageFlags.Ephemeral });
		}
	}
};
