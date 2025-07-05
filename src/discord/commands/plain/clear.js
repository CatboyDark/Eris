import { PermissionFlagsBits } from 'discord.js';
import { config, getChannel } from '../../../utils/utils.js';

export default {
	name: 'clear',

	async execute(message) {
		if (!config.link.channel.enabled || message.channel.id !== config.link.channel.channelID || !message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

		try {
			await getChannel(config.link.channel.channelID).messages.fetch(config.link.channel.infoMessage);
		}
		catch (e) {
			if (e.message.includes('Unknown Message')) return;
			else console.error('! Command: clear', e);
		}

		await message.delete();

		const messages = await message.channel.messages.fetch({ limit: 100 });

		const toDelete = [];
		for (const msg of messages.values()) {
			if (msg.id === config.link.channel.infoMessage) break;
			toDelete.push(msg);
		}

		try {
			if (toDelete.length === 1) {
				await toDelete[0].delete();
			}
			else {
				await message.channel.bulkDelete(toDelete, true);
			}
		}
		catch (e) {
			if (e.message.includes('Missing Access')) {
				console.error('! Clear', 'I don\'t have permission to delete messages!');
			}
			else {
				console.error('! Clear', e);
			}
		}
	}
};
