const { readConfig, writeConfig } = require('../../../helper/utils.js');
const { createMsg, createRow } = require('../../../helper/builder.js');
// eslint-disable-next-line no-unused-vars
const { Events, Client } = require('discord.js');
const { exec } = require('child_process');
const cron = require('node-cron');
const axios = require('axios');
const util = require('util');
const { logGXP } = require('../logic/GXP/logGXP.js');
const execPromise = util.promisify(exec);

/**
 * @param {Client} client
 */
async function updateCheck(client) {
  const config = readConfig();
  const channel = await client.channels.fetch(config.logsChannel);
  try {
    const [latestHashResult, localHashResult] = await Promise.all([
      axios.get('https://api.github.com/repos/CatboyDark/Eris/commits/main', {
        headers: { Accept: 'application/vnd.github.v3+json' }
      }),
      execPromise('git rev-parse --short HEAD')
    ]);
    const latestHash = latestHashResult.data.sha.substring(0, 7);
    const currentHash = localHashResult.stdout.trim();
    const commitMsg = latestHashResult.data.commit.message;
    if (currentHash !== latestHash) {
      console.warn(`${client.user.username}: Update Available! Run "git pull" to update!`);
    }
    if (config.latestHash !== latestHash) {
      const application = await client.application.fetch();

      await channel.send({
        content: `<@${application.owner.id}>`,
        embeds: [createMsg({ title: 'Update available!', desc: `**Summary:**\n\`${commitMsg}\`` })],
        components: [createRow([{ id: 'update', label: 'Update', style: 'Green' }])]
      });
      config.latestHash = latestHash;
      writeConfig(config);
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
    await channel.send({
      embeds: [createMsg({ title: config.guild, color: 'FF0000', desc: '**Error checking for updates!**' })]
    });
  }
}

module.exports = {
  name: Events.GuildMemberAdd,
  /**
   * @param {Client} client
   */
  async execute(client) {
    await updateCheck(client);
    cron.schedule('0 */1 * * *', async () => await updateCheck(client));

    // 00:01 PST every day
    cron.schedule(
      '1 22 * * *',
      async () => {
        const config = readConfig();
        await logGXP();
        await client.channels.fetch(config.logsChannel).then((channel) => {
          channel.send({
            embeds: [createMsg({ title: config.guild, desc: '**Daily GXP database has been updated!**' })]
          });
        });
      },
      { timezone: 'America/Los_Angeles' }
    );
  }
};
