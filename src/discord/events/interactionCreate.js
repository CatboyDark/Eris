const { readConfig, readLogic } = require('../../helper/utils.js');
const { createMsg } = require('../../helper/builder.js');
const log = require('../../helper/logger.js');
// eslint-disable-next-line no-unused-vars
const { Events, BaseInteraction } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {BaseInteraction} interaction
   */
  async execute(interaction) {
    log(interaction);
    if (interaction.isChatInputCommand()) {
      try {
        const command = interaction.client.slashCommands.get(interaction.commandName);
        await command.execute(interaction);
      } catch (error) {
        console.log(error);
        const config = readConfig();
        const channel = await interaction.client.channels.fetch(config.logsChannel);
        const application = await interaction.client.application.fetch();
        await channel.send({
          content: `<@${application.owner.id}>`,
          embeds: [
            createMsg({
              color: 'FF0000',
              title: 'A Silly Has Occured!',
              desc: `\`${error.message}\`\n\n**If you believe this is a bug, please contact <@622326625530544128>.**`
            })
          ]
        });

        const errorMessage = createMsg({
          color: 'FF0000',
          title: "Oops! That wasn't supposed to happen!",
          desc: 'Staff has been notified. Thank you for your patience!'
        });

        if (interaction.replied || interaction.deferred) return interaction.followUp({ embeds: [errorMessage] });
        return interaction.reply({ embeds: [errorMessage] });
      }
    }
    const Logic = readLogic();
    if (interaction.isButton()) {
      // Exceptions
      const buttonMap = {
        logging: ['logsToggle', 'logCommandsToggle', 'logButtonsToggle', 'logMenusToggle', 'logFormsToggle'],
        welcome: ['welcomeMsgToggle', 'welcomeRoleToggle', 'removeRoleOnLink'],
        accountLinking: ['linkRoleToggle', 'guildRoleToggle'],
        guildRanksToggle: ['guildRank1', 'guildRank2', 'guildRank3', 'guildRank4', 'guildRank5']
      };

      const buttonHandler = Object.keys(Logic).reduce((acc, logicName) => {
        acc[logicName] = Logic[logicName];

        for (const [exceptionLogic, buttonIds] of Object.entries(buttonMap)) {
          if (exceptionLogic === logicName) {
            buttonIds.forEach((buttonId) => {
              acc[buttonId] = Logic[exceptionLogic];
            });
          }
        }

        return acc;
      }, {});

      if (buttonHandler[interaction.customId]) {
        await buttonHandler[interaction.customId](interaction);
      } else {
        const exceptionLogic = Object.keys(buttonMap).find((logic) => buttonMap[logic].includes(interaction.customId));
        if (!exceptionLogic) return console.warn(`Logic for ${interaction.customId} does not exist!`);
        if (!Logic[exceptionLogic]) {
          console.warn(`Logic for ${interaction.customId} (${exceptionLogic}) does not exist!`);
        }
      }
    } else if (interaction.isModalSubmit()) {
      // Exceptions
      const formMap = {
        createLevelRoles: [
          'level0Form',
          'level40Form',
          'level80Form',
          'level120Form',
          'level160Form',
          'level200Form',
          'level240Form',
          'level280Form',
          'level320Form',
          'level360Form',
          'level400Form',
          'level440Form',
          'level480Form'
        ],
        guildRanksToggle: ['guildRank1Form', 'guildRank2Form', 'guildRank3Form', 'guildRank4Form', 'guildRank5Form']
      };

      const formHandler = Object.keys(Logic).reduce((acc, logicName) => {
        const formId = `${logicName}Form`;
        acc[formId] = Logic[logicName];

        if (formMap[logicName]) {
          formMap[logicName].forEach((formId) => {
            acc[formId] = Logic[logicName];
          });
        }

        return acc;
      }, {});

      const logicName = interaction.customId.replace(/Form$/, '');
      const handler = formHandler[`${logicName}Form`];

      if (handler) {
        await handler(interaction);
      } else {
        const exceptionLogic = Object.keys(formMap).find((logic) => formMap[logic].includes(interaction.customId));

        if (exceptionLogic) {
          console.warn(`Logic for ${interaction.customId} (${exceptionLogic}) does not exist!`);
        } else {
          console.warn(`Logic for ${interaction.customId} does not exist!`);
        }
      }
    } else if (interaction.isStringSelectMenu()) {
      const menuMap = {
        createLevelRoles: [
          'level0',
          'level40',
          'level80',
          'level120',
          'level160',
          'level200',
          'level240',
          'level280',
          'level320',
          'level360',
          'level400',
          'level440',
          'level480'
        ]
      };

      const selectedValue = interaction.values[0];
      let logicFunction = Logic?.[selectedValue] || null;
      if (!logicFunction) {
        const mappedLogicKey = Object.keys(menuMap).find((key) => menuMap[key].includes(selectedValue));
        if (mappedLogicKey) logicFunction = Logic?.[mappedLogicKey] || null;
      }

      if (!logicFunction) {
        const missingKey = Object.keys(menuMap).find((key) => menuMap[key].includes(selectedValue)) || undefined;
        if (missingKey) {
          console.warn(`Logic for ${selectedValue} (${missingKey}) does not exist!`);
        } else {
          console.warn(`Logic for ${selectedValue} does not exist!`);
        }
        return;
      }

      await logicFunction(interaction);
    }
  }
};
