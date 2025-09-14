import { createMsg, DCsend } from '../../../utils/utils.js';

export default {
	name: 'setcalamity',
	desc: 'Setup Calamity channel',
	options: [
		{ type: 'channel', name: 'channel', desc: 'Enter a channel' }
	],
	permissions: 0,

	async execute(interaction) {
		const channel = interaction.options.getChannel('channel') ?? interaction.channel;
		await DCsend(channel, [
			[{ img: 'https://raw.githubusercontent.com/CatboyDark/Eris/refs/heads/Calamity/assets/Calamity%20Recruiting%20Poster.png' }],
			{ desc: '**Friend Invites →** Legends and above may invite players Level 200 or Cata 40' },
			[
				{ id: 'joinCalamity', label: 'Join Our Guild!', color: 'Green' }
			]
		]);

		interaction.reply(createMsg([{ embed: [{ desc: `**Calamity channel has been set to <#${channel.id}>**` }] }], { ephemeral: true }));
	}
};
