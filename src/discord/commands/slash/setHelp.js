import { config, createMsg, DCsend } from '../../../utils/utils.js';
import { DCserver } from '../../_events/clientReady.js';

export default {
	name: 'settickets',
	desc: 'Setup tickets channel',
	options: [
		{ type: 'channel', name: 'channel', desc: 'Enter a channel' }
	],
	permissions: 0,

	async execute(interaction) {
		const channel = interaction.options.getChannel('channel') ?? interaction.channel;
		await DCsend(channel, [
			{
				embed: [{ desc:
					'### Tickets\n' +
					`To contact ${config.guild.name || DCserver.name} staff, please create a ticket.\n\n` +
					'Is someone harassing you? **Report them!**\n' +
					'Questions? Concerns? Suggestions? **We\'re all ears!**'
				}]
			},
			[
				{ id: 'ticketMemberReport', label: 'Report a Member', color: 'Red' },
				{ id: 'ticketGeneralSupport', label: 'General Support', color: 'Green' }
			]
		]);

		interaction.reply(createMsg([{ embed: [{ desc: `**Tickets channel has been set to <#${channel.id}>**` }] }], { ephemeral: true }));
	}
};
