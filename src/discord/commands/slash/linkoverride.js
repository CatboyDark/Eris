import { MessageFlags } from 'discord.js';
import { Config, createMsg, getEmoji, getPlayerByIGN, getRole, InvalidPlayer, LinkedUsers, updateRoles, userError } from '../../../utils/utils.js';

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
			player = await getPlayerByIGN(interaction.options.getString('ign'));
		}
		catch (e) {
			if (e instanceof InvalidPlayer) return interaction.editReply(createMsg([{ color: 'Error', embed: [{ desc: '**Invalid player!**' }] }]));
			else return console.error('Error | Command: linkoverride', e);
		}

		const uuidDoc = LinkedUsers.find(u => u.uuid === player.id);
		const dcidDoc = LinkedUsers.find(u => u.dcid === member.id);

		if (uuidDoc && uuidDoc.dcid !== member.id) {
			const i = LinkedUsers.indexOf(uuidDoc);
			if (i !== -1) LinkedUsers.splice(i, 1);
		}
		if (dcidDoc && dcidDoc.uuid !== player.id) {
			const i = LinkedUsers.indexOf(dcidDoc);
			if (i !== -1) LinkedUsers.splice(i, 1);
		}

		const existing = LinkedUsers.find(u => u.dcid === member.id);
		if (existing) {
			existing.uuid = player.id;
		}
		else {
			LinkedUsers.push({ dcid: member.id, uuid: player.id });
		}

		LinkedUsers.write();

		try {
			await member.setNickname(player.ign);
		}
		catch (e) {
			if (e.message.includes('Missing Permissions')) console.error('Error | Command: link', 'I don\'t have permission to assign nicknames!\n(I am also unable to nick the server owner)');
			else console.error('Error | Command: link', e);
		}

		const addedRoles = [];
		const removedRoles = [];

		if (Config.link.role.enabled) {
			const roleID = Config.link.role.roleID;
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

		if (Config.welcome.roleRemoveOnLink.enabled) {
			for (const roleID of Config.welcome.roleRemoveOnLink.roleIDs) {
				if (!getRole(roleID)) {
					interaction.editReply(userError);
					return console.error('Error | Command: link', `Invalid Welcome Role!${roleID ? ` (ID: ${roleID})` : ''}`);
				}

				try {
					if (member.roles.cache.has(roleID)) {
						await member.roles.remove(roleID);
						removedRoles.push(roleID);
					}
				}
				catch (e) {
					interaction.editReply(userError);
					if (e.message.includes('Missing Permissions')) return console.error('Error | Command: link', `I don\'t have permission to remove Welcome Role!${roleID ? `(ID: ${roleID})` : ''}`);
					else return console.error('Error | Command: link', e);
				}
			}
		}

		const { add, remove } = await updateRoles(player.id);
		console.log(add, remove);

		for (const roleID of add) {
			await member.roles.add(roleID);
			addedRoles.push(roleID);
		}
		for (const roleID of remove) {
			await member.roles.remove(roleID);
			removedRoles.push(roleID);
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
