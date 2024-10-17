const { createForm, createMsg } = require('../../../helper/builder.js');
const { readConfig, writeConfig } = require('../../../helper/utils.js');
const { Errors } = require('hypixel-api-reborn');
const HAPI = require('../../../helper/hapi.js');
const { ActivityType } = require('discord.js');

async function setGuild(interaction) {
  if (!interaction.isModalSubmit()) {
    const modal = createForm({
      id: 'setGuildForm',
      title: 'Set Guild',
      components: [
        {
          id: 'setGuildInput',
          label: 'GUILD:',
          style: 'short',
          required: true
        }
      ]
    });

    return interaction.showModal(modal);
  }

  const input = interaction.fields.getTextInputValue('setGuildInput');

  try {
    const guild = await HAPI.getGuild('name', input);

    await interaction.client.user.setActivity(`${input}`, { type: ActivityType.Watching });
    const config = readConfig();
    config.guild = guild.name;
    writeConfig(config);

    await interaction.reply({
      embeds: [createMsg({ desc: `Guild has been set to **${guild.name}**` })],
      ephemeral: true
    });
  } catch (e) {
    if (e.message === Errors.GUILD_DOES_NOT_EXIST) {
      return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**Invalid Guild!**' })], ephemeral: true });
    }
  }
}

module.exports = {
  setGuild
};
