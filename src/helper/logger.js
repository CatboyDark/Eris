/* eslint-disable indent */

const { readConfig } = require('./configUtils.js');
const { createMsg } = require('./builder.js');
const db = require('../mongo/schemas.js');

async function cmdCounter(command) 
{
    await db.Command.findOneAndUpdate(
        { command },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
    );
}

async function buttonCounter(button, source)
{
	await db.Button.findOneAndUpdate(
		{ button },
        { $inc: { count: 1 }, $set: { source } },
        { upsert: true, new: true }
	);
}

async function createLogMsg(interaction) 
{
	const config = readConfig();

	if (!config.logs.enabled) return null;

	let title;
	let desc;

	switch (true) 
	{
		case interaction.isChatInputCommand():
			if (config.logs.commands) 
			{
				const messageId = await interaction.fetchReply().then(reply => reply.id);
				const options = interaction.options.data.map(option => 
				{
					switch (option.type) 
					{
						case 6:
							return ` <@${option.value}>`;
						case 8:
							return ` <@&${option.value}>`;
						default:
							return ` ${option.value}`;
					}
				}).join(' ');

				title = 'Command';
				desc = 
						`<@${interaction.user.id}> ran **/${interaction.commandName}**${options}\n` +
						`https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${messageId}`;
			} 
			else return null;
			break;

		case interaction.isButton():
			if (config.logs.buttons) 
			{
				title = 'Button';
				desc = 
						`<@${interaction.user.id}> clicked **${interaction.component.label}**.\n` +
						`https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${interaction.message.id}`;
			} 
			else return null;
			break;

		case interaction.isStringSelectMenu():
			if (config.logs.menus)
			{
				const selectMenu = interaction.component;
				const selectedValues = interaction.values;
				const optionLabels = selectedValues.map(value => {
					const option = selectMenu.options.find(option => option.value === value);
					return option ? option.label : value;
				});
				title = 'Menu';
				desc = 
						`<@${interaction.user.id}> selected **${optionLabels.join(', ')}** from **${interaction.component.placeholder}**\n` +
						`https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${interaction.message.id}`;
			} 
			else return null;
			break;

		case interaction.isModalSubmit():
			if (config.logs.forms) 
			{
				title = 'Form';
				desc = 
						`<@${interaction.user.id}> submitted **${interaction.customId}**\n` +
						`https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${interaction.message.id}`;
			} 
			else return null;
			break;
	}

	return createMsg({ title, desc, timestamp: 'relative' });
}

async function log(interaction) 
{
	if (interaction.isChatInputCommand()) await cmdCounter(interaction.commandName);
	if (interaction.isButton()) await buttonCounter(interaction.component.label, interaction.customId);

	const config = readConfig();
	const logsChannel = await interaction.guild.channels.cache.get(config.logsChannel);
	const message = await createLogMsg(interaction);
	if (message) await logsChannel.send({ embeds: [message] });
}

module.exports = log;
