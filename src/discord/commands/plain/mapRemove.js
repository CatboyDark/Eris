import { getPerms, readConfig, writeConfig } from '../../../helper.js';

export default {
	name: 'mapremove',
	prefix: true,

	async execute(message) {
		const config = readConfig();
		const perms = getPerms(message.member);
		if (!perms.includes('SetMapChannel')) return;

		const channel = await message.guild.channels.cache.get(config.map.channel);
		for (const id of config.map.messages) {
			const msg = await channel.messages.fetch(id);
			await msg.delete();
		}

		await message.delete();

		config.map.channel = '';
		config.map.messages = [];
		writeConfig(config);
	}
};

