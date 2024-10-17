const { createForm, createMsg } = require('../../../helper/builder.js');
const { linkButtons } = require('./link.js');

const invalidChannel = createMsg({ color: 'Red', desc: "**That's not a valid Channel ID!**" });

async function setLinkChannel(interaction) {
  if (!interaction.isModalSubmit()) {
    const modal = createForm({
      id: 'setLinkChannelForm',
      title: 'Set Link Channel',
      components: [
        {
          id: 'setLinkChannelInput',
          label: 'CHANNEL ID:',
          style: 'short',
          required: true
        }
      ]
    });

    return interaction.showModal(modal);
  }

  const input = await interaction.fields.getTextInputValue('setLinkChannelInput');
  const channel = await interaction.guild.channels.fetch(input).catch(() => {
    return null;
  });
  if (!channel) {
    return interaction.reply({ embeds: [invalidChannel], ephemeral: true });
  }

  const application = await interaction.client.application.fetch();
  const emojis = await application.emojis.fetch();
  const check = emojis.find((emoji) => {
    return 'check' === emoji.name;
  });
  await channel.send({
    embeds: [
      createMsg({
        desc:
          `### ${check} Link your Account!\n` +
          'Enter your IGN to connect your Hypixel account.\n\n' +
          '*Please contact a staff member if the bot is down or if you require further assistance.*'
      })
    ],
    components: [linkButtons]
  });
  interaction.reply({
    embeds: [createMsg({ desc: `**Link Channel has been set to** <#${input}>` })],
    ephemeral: true
  });
}

module.exports = {
  setLinkChannel
};
