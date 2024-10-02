const { exec } = require('child_process');
const { createMsg } = require('../../../helper/builder');

const errors = (error, stderr) => {
  if (error) {
    console.log(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`STD Error: ${stderr}`);
  }
};

module.exports = {
  name: 'stop',
  desc: 'Kills the bot',
  permissions: ['Administrator'],

  async execute(interaction) {
    exec('pm2 stop Eris', errors);
    await interaction.reply({ embeds: [createMsg({ desc: '**Stopping...**' })], ephemeral: true });
  }
};
