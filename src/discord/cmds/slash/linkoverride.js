const { createMsg } = require('../../../helper/builder.js');
const { updateRoles } = require('../../../helper/utils.js');
const { Link } = require('../../../mongo/schemas.js');
const { Errors } = require('hypixel-api-reborn');
const HAPI = require('../../../helper/hapi.js');

module.exports = {
  name: 'linkoverride',
  desc: 'Link Override',
  options: [
    { type: 'user', name: 'discord', desc: 'Discord', required: true },
    { type: 'string', name: 'ign', desc: 'IGN', required: true }
  ],
  permissions: ['ManageRoles'],

  async execute(interaction) {
    const user = interaction.options.getUser('discord');
    const member = interaction.guild.members.cache.get(user.id);
    const application = await interaction.client.application.fetch();
    const emojis = await application.emojis.fetch();
    const check = emojis.find((emoji) => {
      return 'check' === emoji.name;
    });
    const plus = emojis.find((emoji) => {
      return 'plus' === emoji.name;
    });
    const minus = emojis.find((emoji) => {
      return 'minus' === emoji.name;
    });
    await interaction.deferReply();
    try {
      const player = await HAPI.getPlayer(interaction.options.getString('ign'));
      const existingEntry = await Link.findOne({ $or: [{ uuid: player.uuid }, { dcid: user.id }] });
      if (existingEntry) {
        await Link.updateOne({ _id: existingEntry._id }, { uuid: player.uuid, dcid: user.id });
      } else {
        await Link.create({ uuid: player.uuid, dcid: user.id });
      }
      const { addedRoles, removedRoles } = await updateRoles(member, player.uuid, true);
      let roleDesc = '';
      if (addedRoles.length > 0 && removedRoles.length > 0) {
        roleDesc = `\n\n${addedRoles
          .map((roleID) => {
            return `${plus} <@&${roleID}>`;
          })
          .join('\n')}\n_ _\n`;
        roleDesc += `${removedRoles
          .map((roleID) => {
            return `${minus} <@&${roleID}>`;
          })
          .join('\n')}`;
      } else if (addedRoles.length > 0) {
        roleDesc = `\n\n${addedRoles
          .map((roleID) => {
            return `${plus} <@&${roleID}>`;
          })
          .join('\n')}\n_ _`;
      } else if (removedRoles.length > 0) {
        roleDesc = `\n\n${removedRoles
          .map((roleID) => {
            return `${minus} <@&${roleID}>`;
          })
          .join('\n')}\n_ _`;
      }
      const desc = `${check} **Successfully linked ${user} to ${player.nickname}**${roleDesc}`;
      await interaction.followUp({ embeds: [createMsg({ desc })] });
    } catch (e) {
      if (e.message === Errors.PLAYER_DOES_NOT_EXIST) {
        return interaction.followUp({ embeds: [createMsg({ color: 'Red', desc: '**Invalid Username!**' })] });
      }
      console.log(e);
    }
  }
};
