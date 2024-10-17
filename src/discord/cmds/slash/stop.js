const { createMsg } = require('../../../helper/builder');
const { exec } = require('child_process');

module.exports = {
  name: 'stop',
  desc: 'Kills the bot',
  permissions: ['Administrator'],

  async execute(interaction) {
    exec('pm2 stop Eris', (error, stderr) => {
      if (error) {
        console.log(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`STD Error: ${stderr}`);
      }
    });
    await interaction.reply({ embeds: [createMsg({ desc: '**Stopping...**' })], ephemeral: true });
  }
};
