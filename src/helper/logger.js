import { createMsg } from './builder.js';
import { Command, Button } from '../mongo/schemas.js';
import { readConfig } from './utils.js';

async function cmdCounter(command) {
	await Command.findOneAndUpdate(
		{ command },
		{ $inc: { count: 1 } },
		{ upsert: true, new: true }
	);
}

async function buttonCounter(button, source) {
	await Button.findOneAndUpdate(
		{ button },
		{ $inc: { count: 1 }, $set: { source } },
		{ upsert: true, new: true }
	);
}

function createLogMsg(interaction) {
	const config = readConfig();

	if (!config.logs.enabled) {
		return null;
	}

	let title;
	let desc;

	switch (true) {
		case interaction.isChatInputCommand():
			if (config.logs.commands) {
				const options = interaction.options.data.map((option) =>
					option.type === 6 ? ` <@${option.value}> ` : 
					option.type === 8 ? ` <@&${option.value}> ` : 
					` ${option.value} `
				);

				const optionsString =
						options.length > 0 ? `**[**${options.join('**,** ')}**]**` : '';

				title = 'Command';
				desc = `<@${interaction.user.id}> ran **/${interaction.commandName}** ${ optionsString }\n
						${interaction.message.url}`;
			}
			else {
				return null;
			}
			break;

		case interaction.isButton():
			if (config.logs.buttons) {
				title = 'Button';
				desc =
						`<@${interaction.user.id}> clicked **${interaction.component.label}**.\n
						${interaction.message.url}`;
			}
			else {
				return null;
			}
			break;

		case interaction.isStringSelectMenu():
			if (config.logs.menus) {
				const selectMenu = interaction.component;
				const selectedValues = interaction.values;
				const optionLabels = selectedValues.map((value) => {
					const option = selectMenu.options.find(
						(option) => option.value === value
					);
					return option ? option.label : value;
				});
				title = 'Menu';
				desc =
						`<@${interaction.user.id}> selected **${optionLabels.join(', ')}** from **${interaction.component.placeholder}**\n
						${interaction.message.url}`;
			}
			else {
				return null;
			}
			break;

		case interaction.isModalSubmit():
			if (config.logs.forms) {
				title = 'Form';
				desc =
						`<@${interaction.user.id}> submitted **${interaction.customId}**\n
						${interaction.message.url}`;
			}
			else {
				return null;
			}
			break;

		default: 
			{
				console.log('Unknown interaction!');
			}
	}

	const icon = interaction.user.displayAvatarURL();
	return createMsg({ icon, title, desc, timestamp: 'relative' });
}

async function log(interaction) {
	if (interaction.isChatInputCommand()) {
		await cmdCounter(interaction.commandName);
	}
	if (interaction.isButton()) {
		await buttonCounter(interaction.component.label, interaction.customId);
	}

	const config = readConfig();
	const server = config.serverID;
	const guild = await interaction.client.guilds.cache.get(server);
	const channel = await guild.channels.cache.get(config.logsChannel);
	const message = await createLogMsg(interaction);
	if (message) {
		await channel.send({ embeds: [message] });
	}
}

export default log;
