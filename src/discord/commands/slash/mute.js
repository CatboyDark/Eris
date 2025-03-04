import { MessageFlags } from 'discord.js';
import { createMsg, getPerms } from '../../../helper.js';

export default {
	name: 'mute',
	desc: 'Mute member',
	options: [
		{ type: 'user', name: 'user', desc: 'User', required: true },
		{ type: 'string', name: 'length', desc: 'Mute Duration (Ex: 5m, 12h, 30d)', required: true },
		{ type: 'string', name: 'reason', desc: 'Reason', required: true }
	],

	async execute(interaction) {
		const perms = getPerms(interaction.member);
		if (!perms.includes('MuteMembers')) return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**You don\'t have permission to use this command!**' })], flags: MessageFlags.Ephemeral });

		const user = interaction.options.getUser('user');
		const member = interaction.guild.members.cache.get(user.id);
		const length = interaction.options.getString('length');
        const reason = interaction.options.getString('reason');

		let muteDuration;
		let lengthExtended;

        const timeRegex = /(\d+)([mhd])/;
        const match = length.match(timeRegex);

        if (match) {
            const amount = parseInt(match[1], 10);
            const unit = match[2];

            switch (unit) {
                case 'm':
                    muteDuration = amount * 60 * 1000;
                    lengthExtended = `${amount} minute${amount !== 1 ? 's' : ''}`;
                    break;

                case 'h':
                    muteDuration = amount * 60 * 60 * 1000;
                    lengthExtended = `${amount} hour${amount !== 1 ? 's' : ''}`;
                    break;

                case 'd':
                    muteDuration = amount * 24 * 60 * 60 * 1000;
                    lengthExtended = `${amount} day${amount !== 1 ? 's' : ''}`;
                    break;

                default:
                	return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**Invalid mute length!**' })], flags: MessageFlags.Ephemeral });
            }
        }
		else {
            return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**Invalid mute length!**' })], flags: MessageFlags.Ephemeral });
        }

		try {
            await member.timeout(muteDuration, reason);
            interaction.reply({ embeds: [createMsg({ desc: `**<@${user.id}> has been muted for ${lengthExtended}!**` })], flags: MessageFlags.Ephemeral });
        }
		catch (e) {
			if (e.message.includes('Missing Permissions')) {
				return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: `**You don\'t have permission to mute <@${user.id}>!**` })], flags: MessageFlags.Ephemeral });
			}
			console.log(e);
		}
	}
};
