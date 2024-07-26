/* eslint-disable indent */

const { readConfig } = require('./configUtils.js');
const { createMsg } = require('./builder.js');

async function logMsg(interaction) 
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
				title = 'Command';
				desc = 
						`<@${interaction.user.id}> ran **/${interaction.commandName}**.\n` +
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
						`<@${interaction.user.id}> selected **${optionLabels.join(', ')}** from **${interaction.component.placeholder}**.\n` +
						`https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${interaction.message.id}`;
			} 
			else return null;
			break;

		case interaction.isModalSubmit():
			if (config.logs.forms) 
			{
				title = 'Form';
				desc = 
						`<@${interaction.user.id}> submitted **${interaction.customId}**.\n` +
						`https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${interaction.message.id}`;
			} 
			else return null;
			break;
	}

	return createMsg({ title, desc, timestamp: 'relative' });
}

async function log(interaction) 
{
	const config = readConfig();
	const logsChannel = await interaction.guild.channels.cache.get(config.logsChannel);
	const message = await logMsg(interaction);
	if (message) 
	{
		await logsChannel.send({ embeds: [message] });
	}
}

module.exports = { logMsg, log };
