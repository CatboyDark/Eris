const { createMsg } = require('../../helper/builder.js');
const { readConfig } = require('../../helper/utils.js');
// eslint-disable-next-line no-unused-vars
const { Events, GuildMember } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  /**
   * @param {GuildMember} member
   */
  async execute(member) {
    const config = readConfig();

    if (config.features.welcomeRoleToggle) {
      await member.roles.add(config.features.welcomeRole);
    }

    if (config.features.welcomeMsgToggle) {
      const welcomeChannel = member.guild.channels.cache.get(config.features.welcomeChannel);
      if (welcomeChannel.guild.id !== member.guild.id) return;
      let welcomeMsg = config.features.welcomeMsg || `### Welcome to the ${config.guild} server!\n### @member`;
      welcomeMsg = welcomeMsg.replace(/@member/g, member.toString());
      const msg = createMsg({
        desc: welcomeMsg,
        icon: member.user.displayAvatarURL()
      });
      await welcomeChannel.send({ embeds: [msg] });
      await welcomeChannel.send(`${member}`).then((message) => message.delete());
    }
  }
};
