import { config, createMsg, DCsend, getEmoji, saveConfig } from '../../../utils/utils.js';

export default {
	name: 'setlink',
	desc: 'Setup account linking channel',
	options: [
		{ type: 'channel', name: 'channel', desc: 'Enter a channel' }
	],
	permissions: 0,

	async execute(interaction) {
		const channel = interaction.options.getChannel('channel') ?? interaction.channel;
		const check = await getEmoji('check');
		const infoMessage = await DCsend(channel, [
			{
				embed: [{ desc:
					`### ${check} Link your Account!\n` +
					'Run `/link` to link your account.\n' +
					'Ex. \`/link Technoblade\`\n\n' +
					'-# Please ping a staff member if the bot is down or if you require further assistance.'
				}]
			},
			[{ id: 'linkHelp', label: 'How To Link', color: 'Gray' }]
		]);

		config.link.channel.enabled;
		config.link.channel.infoMessage = infoMessage.id;
		config.link.channel.channelID = channel.id;
		saveConfig();

		interaction.reply(createMsg([{ embed: [{ desc: `**Account Linking channel has been set to <#${channel.id}>**` }] }], { ephemeral: true }));
	}
};
