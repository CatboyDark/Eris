import { MessageFlags } from 'discord.js';
import { config, createMsg, getEmoji, getGuild, getPlayer, getRole, InvalidPlayer, membersDB, userError } from '../../../utils/utils.js';

export default {
	name: 'linkoverride',
	desc: 'Link override',
	options: [
		{ type: 'user', name: 'discord', desc: 'Discord', required: true },
		{ type: 'string', name: 'ign', desc: 'IGN', required: true }
	],
	permissions: 0,

	async execute(interaction) {
		interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const member = interaction.options.getMember('discord');

		let player;
		try {
			player = await getPlayer(interaction.options.getString('ign'));
		}
		catch (e) {
			if (e instanceof InvalidPlayer) return interaction.editReply(createMsg([{ color: 'Error', embed: [{ desc: '**Invalid player!**' }] }]));
		}

		const uuidDoc = await membersDB.findOne({ uuid: player.id });
		const dcidDoc = await membersDB.findOne({ dcid: member.id });

		if (uuidDoc && uuidDoc.dcid !== member.id) await membersDB.deleteOne({ uuid: player.id });
		if (dcidDoc && dcidDoc.uuid !== player.id) await membersDB.deleteOne({ dcid: member.id });

		await membersDB.findOneAndUpdate(
			{ dcid: member.id },
			{ $set: { uuid: player.id, dcid: member.id } },
			{ upsert: true }
		);

		try {
			await member.setNickname(player.ign);
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
				if (!member.roles.cache.has(roleID)) {
					await member.roles.add(roleID);
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
					await member.roles.remove(roleID);
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
			const guild = await getGuild.player(player.ign);
			const roleID = config.guild.role.roleID;
			if (!getRole(roleID)) {
				interaction.editReply(userError);
				return console.error('Error | Command: link', 'Invalid Guild Role!');
			}

			try {
				if (guild.name === config.guild.name && !member.roles.cache.has(roleID)) {
					await member.roles.add(roleID);
					addedRoles.push(roleID);
				}
				else if (guild.name !== config.guild.name && interaction.member.roles.cache.has(roleID)) {
					await member.roles.remove(roleID);
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

		let desc = `${check} **Linked ${member} to ${player.ign}!**`;
		if (addedRoles.length) desc += `\n\n${addedRoles.map((role) => `${plus} <@&${role}>`).join('\n')}`;
		if (removedRoles.length) desc += `\n\n${removedRoles.map((role) => `${minus} <@&${role}>`).join('\n')}\n`;

		interaction.editReply(createMsg([{ embed: [{ desc }] }]));
	}
};
