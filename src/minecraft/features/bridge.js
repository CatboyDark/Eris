const { readConfig } = require('../../helper/utils.js');

function bridgeMessage(bot, client) {
  const ignore = [
    'Unknown command.',
    'A kick occurred in your connection, so you have been routed to limbo!',
    'disconnect.spam',
    '/limbo for more information.',
    'You are currently APPEARING OFFLINE'
  ];

  const config = readConfig();

  // Ingame -> Discord
  bot.on('message', (message) => {
    if (!config.features.bridgeToggle) {
      return;
    }

    const content = message.toString().trim();
    const isIgnored = ignore.some((ignoredPhrase) => {
      return content.startsWith(ignoredPhrase);
    });
    if (content.length < 1 || isIgnored) {
      return;
    }

    const fContent = content
      .replace(/<@/g, '<@\u200B')
      .replace(/<#/g, '<#\u200B')
      .replace(/<:/g, '<:\u200B')
      .replace(/<a/g, '<a\u200B')
      .replace(/@everyone/g, '@ everyone')
      .replace(/@here/g, '@ here');

    const channel = client.channels.cache.get(config.features.bridgeChannel);
    channel.send(`${fContent}`);
  });

  // Discord -> Ingame
  client.on('messageCreate', (message) => {
    if (!config.features.bridgeToggle) {
      return;
    }

    const channel = client.channels.cache.get(config.features.bridgeChannel);
    if (message.channel.id === channel?.id) {
      const content = message.content;
      if (message.author.bot) {
        return;
      }

      bot.chat(content);
    }
  });
}

module.exports = bridgeMessage;
