const { createMsg, createError } = require('../../../helper/builder.js');
const { updateRoles } = require('../../../helper/utils.js');
const { Link } = require('../../../mongo/schemas.js');
const HAPI = require('../../../helper/hapi.js');

module.exports = {
  name: 'roles',
  desc: 'Update your roles',

  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.user.id;
    const application = await interaction.client.application.fetch();
    const emojis = await application.emojis.fetch();
    const plus = emojis.find((emoji) => 'plus' === emoji.name);
    const minus = emojis.find((emoji) => 'minus' === emoji.name);
    try {
      const data = await Link.findOne({ dcid: user }).exec();
      if (!data) {
        return interaction.followUp({
          embeds: [createError('**You are not linked! Please run /link to link your account!**')],
          ephemeral: true
        });
      }
      const uuid = data.uuid;

      const player = await HAPI.getPlayer(uuid);
      try {
        await interaction.member.setNickname(player.nickname);
      } catch (e) {
        if (e.message.includes('Missing Permissions')) {
          interaction.followUp({
            embeds: [createMsg({ color: 'FFD800', desc: "**I don't have permission to change your nickname!**" })]
          });
        }
      }
      const { addedRoles, removedRoles } = await updateRoles(interaction.member, player.uuid);
      let desc;
      if (addedRoles.length > 0 && removedRoles.length > 0) {
        desc = '**Your roles have been updated!**\n_ _\n';
        desc += `${addedRoles.map((roleId) => `${plus} <@&${roleId}>`).join('\n')}\n_ _\n`;
        desc += `${removedRoles.map((roleId) => `${minus} <@&${roleId}>`).join('\n')}`;
      } else if (addedRoles.length > 0) {
        desc = '**Your roles have been updated!**\n_ _\n';
        desc += `${addedRoles.map((roleId) => `${plus} <@&${roleId}>`).join('\n')}\n_ _`;
      } else if (removedRoles.length > 0) {
        desc = '**Your roles have been updated!**\n_ _\n';
        desc += `${removedRoles.map((roleId) => `${minus} <@&${roleId}>`).join('\n')}\n_ _`;
      } else {
        desc = '**Your roles are up to date!**';
      }
      return interaction.followUp({ embeds: [createMsg({ desc })] });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
};
