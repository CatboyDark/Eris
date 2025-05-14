import { createMsg, getOnlineMembers } from '../../../utils/utils.js';

export default
{
	name: 'online',
	desc: 'Show online members',

	async execute(interaction) {
		const { guildName, membersOnline, membersTotal, onlineList } = await getOnlineMembers();
		const fields = onlineList.map(entry => ({
			title: entry.rank,
			desc: entry.members.length > 0 ? entry.members.map(name => name.replace(/([\\*_`~|<>\[\](){}#+\-.!])/g, '\\$1')).join(', ') : '*None*'
		}));

		await interaction.reply({ embeds: [createMsg({
			desc: `### ${guildName}\nOnline Members: ${membersOnline.length}/${membersTotal}`,
			fields
		})] });
	}
};
