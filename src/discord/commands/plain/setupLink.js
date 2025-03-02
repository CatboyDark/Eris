import { createMsg, createRow, getEmoji, getPerms, readConfig, writeConfig } from '../../../helper.js';

export default {
	name: 'setlink',
	prefix: true,

	async execute(message) {
		const config = readConfig();
		const perms = getPerms(message.member);
		if (!perms.includes('SetLinkChannel')) return;

		const check = await getEmoji('check');
		const infoMessage = await message.channel.send({
			embeds: [createMsg({
				desc:
					`### ${check} Link your Account!\n` +
					'Run `/link` to link your account.\n' +
					'Ex. \`/link Technoblade\`\n\n' +
					'-# Please contact a staff member if the bot is down or if you require further assistance.'
				})
			],
			components: [createRow([{ id: 'linkHelp', label: 'How To Link', color: 'Gray' }])]
		});

		await message.delete();

		config.link.infoMessage = infoMessage.id;
		config.link.channel = infoMessage.channel.id;
		writeConfig(config);
	}
};
