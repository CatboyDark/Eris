const { createMsg } = require('../../../helper/builder.js');

module.exports = {
  name: '.h',

  async execute(message) {
    await message.channel.send({ embeds: [createMsg({ desc: '**Super Secret Staff Commands owo**' })] });
  }
};
