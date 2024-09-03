const cron = require('node-cron');
const { readConfig, toggleConfig } = require('../../helper/utils.js');
const { logGXP } = require('../logic/GXP/logGXP.js');
const { createMsg } = require('../../helper/builder.js');
const { Events } = require('discord.js');
const { sendStaffInactivityNotif, sendInactivityNotif } = require('../logic/GXP/inactivityNotif.js');

module.exports =
[{
    name: Events.ClientReady,
    async execute(client) {
        const config = readConfig();

        cron.schedule('1 22 * * *', async() => { // 00:01 PST every day
            await logGXP();

            const channel = await client.channels.fetch(config.logsChannel);
            await channel.send({ embeds: [createMsg({ title: config.guild, desc: '**Daily GXP database has been updated!**' })] });
        },
        {
            timezone: 'America/Los_Angeles'
        });
    }
}];
