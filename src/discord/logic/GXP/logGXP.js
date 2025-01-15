import { getGuild, readConfig } from '../../../helper/utils.js';
import { GXP } from '../../../mongo/schemas.js';

function formatDate(date)
{
	const [year, month, day] = date.split('-');
	return `${year}${month}${day}`;
}

function getToday() // Credits: Kathund
{
	const date = new Date();
	return `${date.getFullYear()}${(date.getMonth() + 1).padStart(2, '0')}${date.getDate().padStart(2, '0')}`;
}

async function logGXP()
{
	console.log('Attempting to log GXP...');
	try
	{
		const config = readConfig();
		const guild = await getGuild('guild', config.guild);
		const today = getToday();

		for (const { uuid, expHistory } of guild.members)
		{
			const entries = expHistory
				.filter(({ day }) => formatDate(day) !== today)
				.map(({ day, exp }) => ({
					date: formatDate(day),
					gxp: exp
				}));

			for (const entry of entries)
			{
				const updateResult = await GXP.updateOne(
					{ uuid, 'entries.date': entry.date },
					{ $set: { 'entries.$.gxp': entry.gxp } }
				);

				if (!updateResult.matchedCount)
				{
					await GXP.updateOne(
						{ uuid },
						{
							$push: {
								entries: {
									$each: [entry],
									$sort: { date: -1 }
								}
							}
						},
						{ upsert: true }
					);
				}
			}
		}
	}
	catch (error)
	{
		console.error('Error logging GXP:', error);
	}
	console.log('Sucessfully logged GXP!');
}

export 
{ 
	logGXP 
};
