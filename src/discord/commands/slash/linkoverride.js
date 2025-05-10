import { MessageFlags } from 'discord.js';
import { getMongo, membersSchema } from '../../../mongo/schemas.js';
import { createMsg, Error, getEmoji, getPerms, getPlayer, updateRoles } from '../../../utils/utils.js';

export default {
	name: 'linkoverride',
	desc: 'Link override',
	options: [
		{ type: 'user', name: 'discord', desc: 'Discord', required: true },
		{ type: 'string', name: 'ign', desc: 'IGN', required: true }
	],

	async execute(interaction) {
		try {
			const perms = getPerms(interaction.member);
			if (!perms.includes('LinkOverride')) return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**You don\'t have permission to use this command!**' })] });

			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			const user = interaction.options.getUser('discord');
			const member = interaction.guild.members.cache.get(user.id);
			const player = await getPlayer(interaction.options.getString('ign'));

			const check = await getEmoji('check');
			const plus = await getEmoji('plus');
			const minus = await getEmoji('minus');

			const members = getMongo('Eris', 'members', membersSchema);

			const existingUUID = await members.findOne({ uuid: player.uuid });
			if (existingUUID && existingUUID.dcid !== user.id) {
				await members.deleteOne({ uuid: player.uuid });
			}

			await members.findOneAndUpdate(
				{ dcid: user.id },
				{ uuid: player.uuid, dcid: user.id },
				{ upsert: true, new: true }
			);

			try {
				await member.setNickname(player.nickname);
			}
			catch (e) {
				if (e.message.includes('Missing Permissions')) {
					await Error('! Link Override !', 'I don\'t have permission to assign nicknames!\n(I am also unable to nick the server owner.)');
				}
				else {
					await Error('! Link Override !', e);
				}
			}

			let addedRoles = [], removedRoles = [];
			try {
				const roles = await updateRoles(member, player);
				addedRoles = roles.addedRoles;
				removedRoles = roles.removedRoles;
			}
			catch (e) {
				if (e.message.includes('Missing Permissions')) {
					await Error('! Member Linking !', 'I don\'t have permission to assign roles!');
				}
				else {
					await Error('! Member Linking !', e);
				}
			}

			let roleDesc = '';
			if (addedRoles.length > 0 && removedRoles.length > 0) {
				roleDesc = `${addedRoles.map((roleID) => `${plus} <@&${roleID}>`).join('\n')}\n_ _\n`;
				roleDesc += `${removedRoles.map((roleID) => `${minus} <@&${roleID}>`).join('\n')}`;
			}
			else if (addedRoles.length > 0) {
				roleDesc = `${addedRoles.map((roleID) => `${plus} <@&${roleID}>`).join('\n')}\n_ _`;
			}
			else if (removedRoles.length > 0) {
				roleDesc = `${removedRoles.map((roleID) => `${minus} <@&${roleID}>`).join('\n')}\n_ _`;
			}

			const desc = `${check} **Successfully linked ${user} to ${player.nickname}!**\n\n${roleDesc}`;

			interaction.editReply({ embeds: [createMsg({ desc: desc })] });
		}
		catch (e) {
			if (e.message.includes('Player does not exist')) {
				return interaction.editReply({ embeds: [createMsg({ color: 'Red', desc: '**Invalid player!**' })] });
			}
			else if (e.message.includes('Missing Permissions')) {
				return interaction.editReply({ embeds: [createMsg({ color: 'FFD800', desc: '**I don\'t have permission to assign your roles!**\n\n-# I must have a role higher than the ones I\'m assigning.' })] });
			}
			else {
				await Error('! Link Override !', e);
			}
		}
	}
};
