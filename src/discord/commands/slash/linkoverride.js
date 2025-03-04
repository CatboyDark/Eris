import { MessageFlags } from 'discord.js';
import { createMsg, getEmoji, getPerms, getPlayer, updateRoles } from '../../../helper.js';
import { getMongo, membersSchema } from '../../../mongo/schemas.js';

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
			const player = await getPlayer(interaction.options.getString('ign'));
			const member = interaction.guild.members.cache.get(user.id);

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

			let nickError = false;
			await interaction.member.setNickname(player.nickname).catch((e) => {
				if (e.message.includes('Missing Permissions')) {
					interaction.editReply({ embeds: [createMsg({ color: 'FFD800', desc: '**I don\'t have permission to change your nickname!**' })] });
					nickError = true;
				}
			});

			let addedRoles = [], removedRoles = [];

			try {
				const roles = await updateRoles(member, player);
				addedRoles = roles.addedRoles;
				removedRoles = roles.removedRoles;
			}
			catch (e) {
				console.log(e);
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

			if (nickError) {
				interaction.followUp({ embeds: [createMsg({ desc: desc })], flags: MessageFlags.Ephemeral });
			}
			else {
				interaction.editReply({ embeds: [createMsg({ desc: desc })] });
			}
		}
		catch (e) {
			if (e.message.includes('Player does not exist')) return interaction.editReply({ embeds: [createMsg({ color: 'Red', desc: '**Invalid Username!**' })] });
			if (e.message.includes('Missing Permissions')) return interaction.editReply({ embeds: [createMsg({ color: 'FFD800', desc: '**I don\'t have permission to assign their roles!**\n\n-# I must have a role higher than the ones I\'m assigning.' })] });
			console.log(e);
		}
	}
};
