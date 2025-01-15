import { ActivityType } from 'discord.js';
import { createForm, createMsg } from '../../../helper/builder.js';
import { readConfig, writeConfig, getGuild } from '../../../helper/utils.js';
import Errors from 'hypixel-api-reborn';

async function setGuild(interaction)
{
	if (!interaction.isModalSubmit())
	{
		const modal = createForm({
			id: 'setGuildForm',
			title: 'Set Guild',
			components: [
				{
					id: 'setGuildInput',
					label: 'GUILD:',
					style: 'short',
					required: true
				}
			]
		});

		return interaction.showModal(modal);
	}

	const input = interaction.fields.getTextInputValue('setGuildInput');

	try
	{
		const guild = await getGuild('guild', input);

		await interaction.client.user.setActivity(`${input}`, { type: ActivityType.Watching });
		const config = readConfig();
		config.guild = guild.name;
		writeConfig(config);

		await interaction.reply({ embeds: [ createMsg({ desc: `Guild has been set to **${guild.name}**` }) ], ephemeral: true });
	}
	catch (e)
	{
		if (e.message === Errors.GUILD_DOES_NOT_EXIST)
		{
			return interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**Invalid Guild!**' })], ephemeral: true });
		}
	}
}

export default 
{
	setGuild
};
