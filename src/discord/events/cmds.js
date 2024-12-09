const { Events, Team } = require('discord.js');
const { createMsg } = require('../../helper/builder.js');
const log = require('../../helper/logger.js');
const { readConfig } = require('../../helper/utils.js');

async function erisError(interaction, error)
{
    const config = readConfig();
    const channel = await interaction.client.channels.fetch(config.logsChannel);

    const e = createMsg({
        color: 'FF0000',
        title: 'A Silly Has Occured!',
        desc:
            `\`${error.message}\`\n\n` +
            '**If you believe this is a bug, please contact <@622326625530544128>.**'
    });

    const app = await interaction.client.application.fetch();

    channel.send({
        content: `<@${app.owner instanceof Team ? app.owner.ownerId : app.owner.id}>`,
        embeds: [e]
    });
    console.error(error);
}

const cmdError = (interaction) =>
{
    return async(error) =>
    {
        await erisError(interaction, error);

        console.log(error);

        const e = createMsg({
            color: 'FF0000',
            title: 'Oops! That wasn\'t supposed to happen!',
            desc: 'Staff has been notified. Thank you for your patience!'
        });
        if (interaction.replied || interaction.deferred)
        {
            return interaction.followUp({ embeds: [e] });
        }
        return interaction.reply({ embeds: [e] });
    };
};

module.exports = [
    {
        name: Events.InteractionCreate,
        async execute(interaction)
        {
            if (!interaction.isChatInputCommand())
            {
                return;
            }
            log(interaction);

            const command = interaction.client.sc.get(interaction.commandName);
            await command.execute(interaction).catch(cmdError(interaction));
        }
    }
];
