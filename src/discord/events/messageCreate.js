import { Events } from 'discord.js';
import { createMsg, getDiscord, getEmoji, getPerms, getPlayer, readConfig, updateRoles } from '../../helper.js';
import { getMongo, membersSchema } from '../../mongo/schemas.js';

const config = readConfig();

async function plainCommands(message) {
	const args = message.content.trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	if (message.client.plainCommands.has(commandName)) {
		const command = message.client.plainCommands.get(commandName);
		await command.execute(message, args);
	}
}

async function link(message) {
	if (message.channel.id !== config.linkChannel) return;

	if (message.content === 'clear') {
		const perms = getPerms(message.member);
		if (!perms.includes('DeleteMessages')) return;

		const messages = await message.channel.messages.fetch({ limit: 100 });

		const deleteMessages = [];
		let infoMessage = false;

		for (const msg of messages.values()) {
			if (msg.id === '1274352383589093376') {
				infoMessage = true;
				break;
			}
			else {
				deleteMessages.push(msg);
			}
			if (deleteMessages.length >= 100 || infoMessage) {
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

	if (message.content.startsWith(config.prefix)) {
		const validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_';
		const ign = message.content.slice(1).split(' ')[0];
		let isValid = true;
		for (let i = 0; i < ign.length; i++) {
			if (validChars.indexOf(ign[i]) === -1) {
				isValid = false;
				break;
			}
		}
		if (!isValid) return;

		try {
			const player = await getPlayer(ign);
			const discord = await getDiscord(ign);

			const check = await getEmoji('check');
			const plus = await getEmoji('plus');
			const minus = await getEmoji('minus');

			if (!discord) return message.reply({ embeds: [createMsg({ color: 'Red', desc: '**Discord is not linked!**' })] });
			if (message.author.username !== discord.toLowerCase()) return message.reply({ embeds: [createMsg({ color: 'Red', desc: '**Discord does not match!**'  })] });

			const members = getMongo('Eris', 'members', membersSchema);
			members.findOneAndUpdate(
				{ $or: [{ uuid: player.uuid }, { dcid: message.author.id }] },
				{ uuid: player.uuid, dcid: message.author.id },
				{ upsert: true, new: true }
			);

			await message.member.setNickname(player.nickname).catch((e) => {
				if (e.message.includes('Missing Permissions')) {
					message.reply({ embeds: [createMsg({ color: 'FFD800', desc: '**I don\'t have permission to change your nickname!**' })] });
				}
			});

			const { addedRoles, removedRoles } = await updateRoles(message.member, player);

			let desc;
			if (addedRoles.length > 0 && removedRoles.length > 0) {
				desc = `${check} **Account linked!**\n_ _\n`;
				desc += `${addedRoles.map((roleID) => `${plus} <@&${roleID}>`).join('\n')}\n_ _\n`;
				desc += `${removedRoles.map((roleID) => `${minus} <@&${roleID}>`).join('\n')}`;
			}
			else if (addedRoles.length > 0) {
				desc = `${check} **Account linked!**\n_ _\n`;
				desc += `${addedRoles.map((roleID) => `${plus} <@&${roleID}>`).join('\n')}\n_ _`;
			}
			else if (removedRoles.length > 0) {
				desc = `${check} **Account linked!**\n_ _\n`;
				desc += `${removedRoles.map((roleID) => `${minus} <@&${roleID}>`).join('\n')}\n_ _`;
			}
			else {
				desc = `${check} **Account linked!**`;
			}

			return message.reply({ embeds: [createMsg({ desc })] });
		}
		catch (error) {
			if (error.message.includes('Player does not exist')) {
				return message.reply({ embeds: [createMsg({ color: 'Red', desc: '**Invalid Username!**' })] });
			}
			if (error.message.includes('Missing Permissions')) {
				return message.reply({ embeds: [createMsg({ color: 'FFD800', desc: '**I don\'t have permission to assign your roles!**\n\n-# I must have a role higher than the ones I\'m assigning.' })] });
			}
		}
	}
}

export default {
	name: Events.MessageCreate,

	async execute(message) {
		if (message.author.bot) return;

		await link(message);
		await plainCommands(message);
	}
};
