const { createMsg } = require('../../../helper/builder');

module.exports = {
  name: 'purge',
  desc: 'Purge messages',
  options: [
    { type: 'integer', name: 'count', desc: 'Number of messages', required: true },
    {
      type: 'string',
      name: 'filter',
      desc: 'User OR bot messages',
      choices: [
        { name: 'Bot Messages', value: 'bot' },
        { name: 'User Messages', value: 'user' }
      ]
    }
  ],
  permissions: ['ManageMessages'],

  async execute(interaction) {
    const filter = interaction.options.getString('filter');
    const count = interaction.options.getInteger('count');
    if (count < 1) {
      return interaction.reply({
        embeds: [createMsg({ color: 'Red', desc: 'You must purge at least one message!' })],
        ephemeral: true
      });
    }
    if (count > 100) {
      return interaction.reply({
        embeds: [createMsg({ color: 'Red', desc: 'You can only purge up to 100 messages!' })],
        ephemeral: true
      });
    }
    let messages = await interaction.channel.messages.fetch({ limit: count });
    if (filter === 'user') {
      messages = messages.filter((msg) => {
        return !msg.author.bot;
      });
    }
    if (filter === 'bot') {
      messages = messages.filter((msg) => {
        return msg.author.bot;
      });
    }
    const now = Date.now();
    messages = messages.filter((msg) => {
      return now - msg.createdTimestamp <= 1209600000;
    });
    if (messages.size > 0) {
      await interaction.channel.bulkDelete(messages, true);
      await interaction.reply({
        embeds: [
          count === 1
            ? createMsg({ desc: '**Deleted a message.**' })
            : createMsg({
                desc: `**Deleted ${messages.size} ${filter ? (filter === 'bot' ? 'bot' : 'user') : ''} messages.**`
              })
        ],
        ephemeral: true
      });
    } else {
      await interaction.reply({
        embeds: [createMsg({ color: 'Red', desc: 'You cannot purge messages older than 14 days!' })],
        ephemeral: true
      });
    }
  }
};
