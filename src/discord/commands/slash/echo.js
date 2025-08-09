import { createMsg } from '../../../utils/utils.js';

export default {
	name: 'echo',
	desc: 'It\'s alive!',
	options: [
		{ type: 'string', name: 'text', desc: 'Enter text', required: true },
		{ type: 'channel', name: 'channel', desc: 'Enter a channel' }
	],
	permissions: 0,

	async execute(interaction) {
		const channel = interaction.options.getChannel('channel') || interaction.channel;
		const text = interaction.options.getString('text');

		const message = await channel.send(text);
		interaction.reply(createMsg([{ embed: [{ desc: `\`${text}\`\n\n${message.url}` }] }], { ephemeral: true }));
	}
};
