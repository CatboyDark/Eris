import { getPerms, readConfig } from '../../../helper.js';

export default {
	name: 'clear',

	async execute(message) {
		const config = readConfig();
		if (message.channel.id !== config.link.channel) return;
		const perms = getPerms(message.member);
		if (!perms.includes('DeleteMessages')) return;

		try {
			await message.guild.channels.cache.get(config.link.channel).messages.fetch(config.link.infoMessage);
		}
		catch (e) {
			if (e.message.includes('Unknown Message')) return;
		}

		message.delete();

		const messages = await message.channel.messages.fetch({ limit: 100 });
		const deleteMessages = [];
		let atInfoMessage = false;

		const ageLimit = Date.now() - 14 * 24 * 60 * 60 * 1000;

		for (const msg of messages.values()) {
			if (msg.id === config.link.infoMessage) {
				atInfoMessage = true;
				break;
			}
			else if (msg.createdTimestamp > ageLimit) {
				deleteMessages.push(msg);
			}
			if (deleteMessages.length >= 100 || atInfoMessage) {
				break;
			}
		}

		if (deleteMessages.length < 2) {
			for (const msg of deleteMessages) {
				await msg.delete();
			}
		}
		else {
			await message.channel.bulkDelete(deleteMessages);
		}
	}
};
