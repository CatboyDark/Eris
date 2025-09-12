import { MessageFlags } from 'discord.js';
import { Config, createMsg, getEmoji, getGuild, getPlayer, getRole, InvalidPlayer, LinkedUsers, updateRoles, userError } from '../../../utils/utils.js';

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
			if (e instanceof InvalidPlayer) return interaction.editReply(createMsg([{ color: 'Error', embed: [{ desc: '**Invalid player!**' }] }]));
			else {
				interaction.editReply(userError);
				return console.error(e);
			}
		}

		if (!player.discord) return interaction.editReply(createMsg([{ color: 'Error', embed: [{ desc: '**Discord is not linked!**' }] }]));
		if (interaction.user.username !== player.discord) return interaction.editReply(createMsg([{ color: 'Error', embed: [{ desc: '**Discord does not match!**' }] }]));

		const uuidDoc = LinkedUsers.find(u => u.uuid === player.id);
		const dcidDoc = LinkedUsers.find(u => u.dcid === interaction.user.id);

		if (uuidDoc && uuidDoc.dcid !== interaction.user.id) {
			const i = LinkedUsers.indexOf(uuidDoc);
			if (i !== -1) LinkedUsers.splice(i, 1);
		}
		if (dcidDoc && dcidDoc.uuid !== player.id) {
			const i = LinkedUsers.indexOf(dcidDoc);
			if (i !== -1) LinkedUsers.splice(i, 1);
		}

		const existing = LinkedUsers.find(u => u.dcid === interaction.user.id);
		if (existing) {
			existing.uuid = player.id;
		}
		else {
			LinkedUsers.push({ dcid: interaction.user.id, uuid: player.id });
		}

		LinkedUsers.write();

		try {
			await interaction.member.setNickname(player.ign);
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

		for (const roleID of add) {
			await interaction.member.roles.add(roleID);
			addedRoles.push(roleID);
		}
		for (const roleID of remove) {
			await interaction.member.roles.remove(roleID);
			removedRoles.push(roleID);
		}

		const check = await getEmoji('check');
		const plus = await getEmoji('plus');
		const minus = await getEmoji('minus');

		let desc = `${check} **${player.ign} is now linked!**`;
		if (addedRoles.length) desc += `\n\n${addedRoles.map((role) => `${plus} <@&${role}>`).join('\n')}`;
		if (removedRoles.length) desc += `\n\n${removedRoles.map((role) => `${minus} <@&${role}>`).join('\n')}\n`;

		interaction.editReply(createMsg([{ embed: [{ desc }] }]));
	}
};
