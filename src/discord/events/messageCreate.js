import { Events, MessageFlags } from 'discord.js';
import { createMsg, getDiscord, getEmoji, getPerms, getPlayer, readConfig, updateRoles } from '../../helper.js';
import { getMongo, membersSchema } from '../../mongo/schemas.js';

export default {
	name: Events.MessageCreate,

	async execute(message) {
		if (message.author.bot) return;

		await plainCommands(message);
		await link(message);
	}
};

async function plainCommands(message) {
	const args = message.content.trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	if (message.client.plainCommands.has(commandName)) {
		const command = message.client.plainCommands.get(commandName);
		await command.execute(message, args);
		return;
	}
}

async function link(message) {
	if (message.content.startsWith('.setlink')) return;

	const config = readConfig();
	if (message.channel.id !== config.link.channel) return;

	if (message.content === 'clear') {
		const perms = getPerms(message.member);
		if (!perms.includes('DeleteMessages')) return;

		const messages = await message.channel.messages.fetch({ limit: 100 });
		const deleteMessages = [];
		let infoMessage = false;

		const ageLimit = Date.now() - 14 * 24 * 60 * 60 * 1000;

		for (const msg of messages.values()) {
			if (msg.id === config.link.infoMessage) {
				infoMessage = true;
				break;
			}
			else if (msg.createdTimestamp > ageLimit) {
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

			if (!discord) return message.reply({ embeds: [createMsg({ color: 'Red', desc: '**Discord is not linked!**' })], flags: MessageFlags.Ephemeral });
			if (message.author.username !== discord.toLowerCase()) return message.reply({ embeds: [createMsg({ color: 'Red', desc: '**Discord does not match!**'  })], flags: MessageFlags.Ephemeral });

			const members = getMongo('Eris', 'members', membersSchema);
			members.findOneAndUpdate(
				{ $or: [{ uuid: player.uuid }, { dcid: message.author.id }] },
				{ uuid: player.uuid, dcid: message.author.id },
				{ upsert: true, new: true }
			);

			await message.member.setNickname(player.nickname).catch((e) => {
				if (e.message.includes('Missing Permissions')) {
					message.reply({ embeds: [createMsg({ color: 'FFD800', desc: '**I don\'t have permission to change your nickname!**' })], flags: MessageFlags.Ephemeral });
				}
			});

			const { addedRoles, removedRoles } = await updateRoles(message.member, player);

			let desc = `${check} **Account linked!**`;
			if (addedRoles.length > 0 && removedRoles.length > 0) {
				desc += `\n_ _\n${addedRoles.map((roleID) => `${plus} <@&${roleID}>`).join('\n')}`;
				desc += `\n_ _\n${removedRoles.map((roleID) => `${minus} <@&${roleID}>`).join('\n')}`;
			}
			else if (addedRoles.length > 0) {
				desc += `\n_ _\n${addedRoles.map((roleID) => `${plus} <@&${roleID}>`).join('\n')}\n_ _`;
			}
			else if (removedRoles.length > 0) {
				desc += `\n_ _\n${removedRoles.map((roleID) => `${minus} <@&${roleID}>`).join('\n')}\n_ _`;
			}
			message.reply({ embeds: [createMsg({ desc: desc })], flags: MessageFlags.Ephemeral });
			// message.delete();
		}
		catch (e) {
			if (e.message.includes('Player does not exist')) return message.reply({ embeds: [createMsg({ color: 'Red', desc: '**Invalid Username!**' })] });
			if (e.message.includes('Missing Permissions')) return message.reply({ embeds: [createMsg({ color: 'FFD800', desc: '**I don\'t have permission to assign your roles!**\n\n-# I must have a role higher than the ones I\'m assigning.' })] });
		}
	}
}
