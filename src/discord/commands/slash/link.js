import { MessageFlags } from 'discord.js';
import { getMongo, membersSchema } from '../../../mongo/schemas.js';
import { createMsg, Error, getDiscord, getEmoji, getPlayer, updateRoles } from '../../../utils/utils.js';

export default {
	name: 'link',
	desc: 'Link your account',
	options: [
		{ type: 'string', name: 'ign', desc: 'Enter your IGN', required: true }
	],

	async execute(interaction) {
		try {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			const ign = interaction.options.getString('ign');
			const player = await getPlayer(ign).catch((e) => {
				if (e.message.includes('Player does not exist.')) return message.reply('Invalid player!');
				if (e.message.includes('Player has never logged into Hypixel.')) return message.reply(`${message.options.ign} doesn't play Hypixel!`);
			});

			const discord = await getDiscord(player);

			const check = await getEmoji('check');
			const plus = await getEmoji('plus');
			const minus = await getEmoji('minus');

			if (!discord) return interaction.editReply({ embeds: [createMsg({ color: 'Red', desc: '**Discord is not linked!**' })] });
			if (interaction.user.username !== discord.toLowerCase()) return interaction.editReply({ embeds: [createMsg({ color: 'Red', desc: '**Discord does not match!**'  })] });

			const members = getMongo('Eris', 'members', membersSchema);
			await members.findOneAndUpdate(
				{ $or: [{ uuid: player.uuid }, { dcid: interaction.user.id }] },
				{ uuid: player.uuid, dcid: interaction.user.id },
				{ upsert: true, new: true }
			);

			try {
				await interaction.member.setNickname(player.nickname);
			}
			catch (e) {
				if (e.message.includes('Missing Permissions')) {
					await Error('! Member Linking !', 'I don\'t have permission to assign nicknames!\n\n(I am also unable to nick the server owner)');
				}
				else {
					await Error('! Member Linking !', e);
				}
			}

			let addedRoles = [], removedRoles = [];
			try {
				const roles = await updateRoles(interaction.member, player);
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
				await Error('! Member Linking !', e);
			}
		}
	}
};
