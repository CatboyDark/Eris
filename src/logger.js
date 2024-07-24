const { readConfig } = require('./configUtils.js');
const { createMsg } = require('./builder.js');

const logMsg = (interaction) => 
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
			title = 'Command';
			desc = 
                    `<@${interaction.user.id}> ran **/${interaction.commandName}**.\n` +
                    `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}`;
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
};

module.exports = { logMsg };
