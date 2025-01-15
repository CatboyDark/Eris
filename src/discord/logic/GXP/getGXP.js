import { readConfig, getGuild, getIGN } from '../../../helper/utils.js';
import { GXP } from '../../../mongo/schemas.js';

async function getGXP(client)
{
	const config = readConfig();
	const guild = await getGuild('guild', config.guild);

	const date = new Date();
	date.setDate(date.getDate() - 14);
	const timeLimit = date.toISOString().slice(0, 10).replace(/-/g, '');
	const app = await client.application.fetch();

	const membersData = [];
	for (const member of guild.members)
	{
		const { uuid, joinedAt } = member;
		const gxpData = await GXP.findOne({ uuid });
		if (gxpData)
		{
			const recentEntries = gxpData.entries.filter( (entry) => entry.date >= timeLimit );
			const totalGXP = recentEntries.reduce((sum, entry) => sum + entry.gxp, 0);
			const user = await getIGN({ username: app.owner.username, id: app.owner.id }, uuid);
			membersData.push({
				uuid,
				ign: user,
				gxp: totalGXP,
				joinDate: joinedAt
			});
		}
	}

	membersData.sort((a, b) => b.gxp - a.gxp);
	return membersData;
}

export 
{
	getGXP
};
