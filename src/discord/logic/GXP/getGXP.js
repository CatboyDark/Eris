const { readConfig, getIGN } = require('../../../helper/utils.js');
const { GXP } = require('../../../mongo/schemas.js');
const HAPI = require('../../../helper/hapi.js');

async function getGXP(client) {
  const config = readConfig();
  const guild = await HAPI.getGuild('name', config.guild);

  const date = new Date();
  date.setDate(date.getDate() - 14);
  const timeLimit = date.toISOString().slice(0, 10).replace(/-/g, '');
  const app = await client.application.fetch();
  const membersData = [];
  for (const member of guild.members) {
    const { uuid, joinedAt } = member;
    const gxpData = await GXP.findOne({ uuid });
    if (gxpData) {
      const recentEntries = gxpData.entries.filter((entry) => {
        return entry.date >= timeLimit;
      });
      const totalGXP = recentEntries.reduce((sum, entry) => {
        return sum + entry.gxp;
      }, 0);

      const user = await getIGN({ username: app.owner.username, id: app.owner.id }, uuid);
      membersData.push({
        uuid,
        ign: user,
        gxp: totalGXP,
        joinDate: joinedAt
      });
    }
  }

  membersData.sort((a, b) => {
    return b.gxp - a.gxp;
  });
  return membersData;
}

module.exports = {
  getGXP
};
