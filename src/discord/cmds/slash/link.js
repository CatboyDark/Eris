import { createMsg } from '../../../helper/builder.js';
import { getEmoji, getPlayer, getDiscord, updateRoles } from '../../../helper/utils.js';
import { Link } from '../../../mongo/schemas.js';
import Errors from 'hypixel-api-reborn';

export default
{
	name: 'link',
	desc: 'Link your account',
	options: [
		{ type: 'string', name: 'ign', desc: 'Enter your IGN', required: true }
	],

	async execute(interaction) {
		await interaction.deferReply();

		const input = interaction.options.getString('ign');
		const check = await getEmoji('check');
		const plus = await getEmoji('plus');
		const minus = await getEmoji('minus');

		try {
			const player = await getPlayer(input);
			const discord = await getDiscord(player.uuid);
			if (!discord) { return interaction.followUp({ embeds: [createMsg({ color: 'Red', desc: '**Discord is not linked!**' })] }); }
			if (interaction.user.username !== discord.toLowerCase()) { return interaction.followUp({ embeds: [createMsg({ color: 'Red', desc: '**Discord does not match!**' })] }); }

			await Link.create({
				uuid: player.uuid,
				dcid: interaction.user.id
			})
			.catch((e) => {
				if (e.code === 11000) {
					console.log('playersLinked: Duplicate Key!');
				}
			});

			await interaction.member.setNickname(player.nickname).catch((e) => {
				if (e.message.includes('Missing Permissions')) { interaction.followUp({ embeds: [createMsg({ color: 'FFD800', desc: '**I don\'t have permission to change your nickname!**' })] }); }
			});

			const { addedRoles, removedRoles } = await updateRoles(interaction.member, player, true);

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

			return interaction.followUp({ embeds: [createMsg({ desc })] });
		}
		catch (e) {
			if (e.message === Errors.PLAYER_DOES_NOT_EXIST) {
				return interaction.followUp({ embeds: [createMsg({ color: 'Red', desc: '**Invalid Username!**' })] });
			}
			
			console.log(e);
		}
	}
};
