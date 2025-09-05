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
			{
				embed: [
					{ desc:
						'### Guild Requirements\n_ _\n' +
						'One of the following- Skyblock Level 280 **OR** Cata 45\n' +
						'-# Friends: Members with guild rank Legend and above may invite anyone above Level 200 or Cata 40\n\n' +
						'- 200k GXP a month\n' +
						'To check your monthly GXP, run `/gxp` in <#1070775232530489356>\n\n' +
						'**Purges will occur at the beginning of every month.**\n' +
						'Run /inactivity if you are unable to meet the gxp reqs.'
					}
				]
			},
			{
				embed: [
					{ desc:
						'### Guild Ranks\n' +
						'**Novice**\nLevel 280\n\n' +
						'**Elite**\nLevel 320\n\n' +
						'**Legend**\nLevel 360\n\n' +
						'**God**\nLevel 400'
					}
				]
			},
			[
				{ id: 'joinCalamity', label: 'Join Our Guild!', color: 'Green' }
			]
		]);

		interaction.reply(createMsg([{ embed: [{ desc: `**Calamity channel has been set to <#${channel.id}>**` }] }], { ephemeral: true }));
	}
};
