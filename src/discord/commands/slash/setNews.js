import { Config, createMsg } from '../../../utils/utils.js';

export default {
	name: 'setnews',
	desc: 'Setup Hypixel Skyblock news channel',
	options: [
		{ type: 'role', name: 'role', desc: 'Enter a role to ping for updates' },
		{ type: 'channel', name: 'channel', desc: 'Enter a channel' }
	],
	permissions: 0,

	async execute(interaction) {
		const channel = interaction.options.getChannel('channel') ?? interaction.channel;
		const role = interaction.options.getRole('role') ?? null;

		Config.sbNews.enabled = true;
		Config.sbNews.channelID = channel.id;
		Config.sbNews.roleID = role ? role.id : null;
		Config.write();

		interaction.reply(createMsg(
			[{ embed: [{ desc: role
				? `**Skyblock news channel has been set to <#${channel.id}> and will ping** ${role}`
				: `**Skyblock news channel has been set to <#${channel.id}>**`
			}] }],
			{ ephemeral: true })
		);
	}
};
