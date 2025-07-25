import { MessageFlags } from 'discord.js';
import { config, createMsg, getEmoji, getGuild, getPlayer, getRole, InvalidIGN, membersDB, userError } from '../../../utils/utils.js';

export default {
	name: 'link',
	desc: 'Link your account',
	options: [
		{ type: 'string', name: 'ign', desc: 'Enter your IGN', required: true }
	],

	async execute(interaction) {
		interaction.deferReply({ flags: MessageFlags.Ephemeral });

		let player;
		try {
			player = await getPlayer(interaction.options.getString('ign'));
		}
		catch (e) {
			if (e instanceof InvalidIGN) return interaction.editReply(createMsg([{ color: 'Error', embed: [{ desc: '**Invalid IGN!**' }] }]));
			else {
				interaction.editReply(userError);
				return console.error(e);
			}
		}

		const discord = player.socialMedia?.links?.DISCORD.toLowerCase();

		if (!discord) return interaction.editReply(createMsg([{ color: 'Error', embed: [{ desc: '**Discord is not linked!**' }] }]));
		if (interaction.user.username !== discord) return interaction.editReply(createMsg([{ color: 'Error', embed: [{ desc: '**Discord does not match!**' }] }]));

		const uuidDoc = await membersDB.findOne({ uuid: player.uuid });
		const dcidDoc = await membersDB.findOne({ dcid: interaction.user.id });

		if (uuidDoc && uuidDoc.dcid !== interaction.user.id) await membersDB.deleteOne({ uuidDoc });
		if (dcidDoc && dcidDoc.uuid !== player.uuid) await membersDB.deleteOne({ dcidDoc });

		await membersDB.findOneAndUpdate(
			{ dcid: interaction.user.id },
			{ $set: { uuid: player.uuid, dcid: interaction.user.id } },
			{ upsert: true }
		);

		try {
			await interaction.member.setNickname(player.displayname);
		}
		catch (e) {
			if (e.message.includes('Missing Permissions')) console.error('Error | Command: link', 'I don\'t have permission to assign nicknames!\n(I am also unable to nick the server owner)');
			else console.error('Error | Command: link', e);
		}

		const addedRoles = [];
		const removedRoles = [];

		if (config.link.role.enabled) {
			const roleID = config.link.role.roleID;
			if (!getRole(roleID)) {
				interaction.editReply(userError);
				return console.error('Error | Command: link', 'Invalid Link Role!');
			}

			try {
				if (!interaction.member.roles.cache.has(roleID)) {
					await interaction.member.roles.add(roleID);
					addedRoles.push(roleID);
				}
			}
			catch (e) {
				interaction.editReply(userError);
				if (e.message.includes('Missing Permissions')) return console.error('Error | Command: link', 'I don\'t have permission to assign Link Role!');
				else return console.error('Error | Command: link', e);
			}
		}

		if (config.welcome.roleRemoveOnLink.enabled) {
			for (const roleID of config.welcome.roleRemoveOnLink.roleIDs) {
				if (!getRole(roleID)) {
					interaction.editReply(userError);
					return console.error('Error | Command: link', `Invalid Welcome Role!${roleID ? ` (ID: ${roleID})` : ''}`);
				}

				try {
					await interaction.member.roles.remove(roleID);
					removedRoles.push(roleID);
				}
				catch (e) {
					interaction.editReply(userError);
					if (e.message.includes('Missing Permissions')) return console.error('Error | Command: link', `I don\'t have permission to remove Welcome Role!${roleID ? `(ID: ${roleID})` : ''}`);
					else return console.error('Error | Command: link', e);
				}
			}
		}

		if (config.guild.role.enabled && config.guild.name) {
			const guild = await getGuild.player(player.displayname);
			const roleID = config.guild.role.roleID;
			if (!getRole(roleID)) {
				interaction.editReply(userError);
				return console.error('Error | Command: link', 'Invalid Guild Role!');
			}

			try {
				if (guild.name === config.guild.name && !interaction.member.roles.cache.has(roleID)) {
					await interaction.member.roles.add(roleID);
					addedRoles.push(roleID);
				}
				else if (guild.name !== config.guild.name && interaction.member.roles.cache.has(roleID)) {
					await interaction.member.roles.remove(roleID);
					removedRoles.push(roleID);
				}
			}
			catch (e) {
				interaction.editReply(userError);
				if (e.message.includes('Missing Permissions')) return console.error('Error | Command: link', 'I don\'t have permission to assign/remove Guild Role!');
				else return console.error('Error | Command: link', e);
			}
		}

		const check = await getEmoji('check');
		const plus = await getEmoji('plus');
		const minus = await getEmoji('minus');

		let desc = `${check} **${player.displayname} is now linked!**`;
		if (addedRoles.length) desc += `\n\n${addedRoles.map((role) => `${plus} <@&${role}>`).join('\n')}`;
		if (removedRoles.length) desc += `\n\n${removedRoles.map((role) => `${minus} <@&${role}>`).join('\n')}\n`;

		interaction.editReply(createMsg([{ embed: [{ desc }] }]));
	}
};
