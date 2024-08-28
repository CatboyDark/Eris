const cron = require('node-cron');
const { readConfig } = require('../../helper/utils.js');
const { logGXP } = require('../logic/GXP/logGXP.js');
const { Events } = require('discord.js');
const { createMsg } = require('../../helper/builder.js');

module.exports = 
[
	{
		name: Events.ClientReady,
		async execute(client) 
		{
			const config = readConfig();

			cron.schedule('1 22 * * *', async () => 
			{
				await logGXP();

				const eventsChannel = await client.channels.fetch(config.eventsChannel);
				await eventsChannel.send({ embeds: [createMsg({ title: config.guild, desc: '**Daily GXP database has been updated!**' })] });
			}, 
			{
				timezone: 'America/Los_Angeles'
			});
		}
	}
];