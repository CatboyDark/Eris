import { getPerms, readConfig, writeConfig } from '../../../helper.js';

export default {
	name: 'linkremove',
	prefix: true,

	async execute(message) {
		const config = readConfig();
		const perms = getPerms(message.member);
		if (!perms.includes('SetLinkChannel')) return;

		const linkMessage = await message.guild.channels.cache.get(config.link.channel).messages.fetch(config.link.infoMessage);

		await linkMessage.delete();
		await message.delete();

		config.link.infoMessage = '';
		config.link.channel = '';
		writeConfig(config);
	}
};
