const hypixel = require('../../../helper/hapi.js');
const db = require('../../../mongo/schemas.js');
const Errors = require('hypixel-api-reborn');
const { createMsg, createRow, createModal } = require('../../../helper/builder.js');
const { readConfig } = require('../../../helper/configUtils.js');

const linkMsg = createMsg({
	desc:
		'### <:gcheck:1244687091162415176> Link your Account!\n' +
        'Connect your Hypixel account to gain server access.\n' +
        '\n' +
        '*Please contact a staff member if the bot is down or if you require further assistance.*'
});

const linkHelpMsg = createMsg({
	title: 'How to Link Your Account',
	desc:
		'1. Connect to __mc.hypixel.net__.\n' +
		'2. Once you\'re in a lobby, click on your head (2nd hotbar slot).\n' +
		'3. Click **Social Media**.\n' +
		'4. Click **Discord**.\n' +
		'5. Type your Discord username into chat.',
	image: 'https://media.discordapp.net/attachments/922202066653417512/1066476136953036800/tutorial.gif'
});

const linkButtons = createRow([
	{ id: 'link', label: 'Link', style: 'Green' },
	{ id: 'linkHelp', label: 'How To Link', style: 'Gray' }
]);

async function link(interaction)
{
	if (!interaction.isModalSubmit())
	{
		const modal = createModal({
			id: 'linkForm',
			title: 'Link Your Account',
			components: [{
				id: 'linkInput',
				label: 'ENTER YOUR IGN:',
				style: 'short',
				required: true,
				length: [3, 16]
			}]
		});
		
		return interaction.showModal(modal); 
	}

	await interaction.deferReply({ ephemeral: true });

	const input = interaction.fields.getTextInputValue('linkInput');

	try
	{
		const config = readConfig();

		const player = await hypixel.getPlayer(input);
		const discord = await player.socialMedia.find(media => media.id === 'DISCORD');
		if (!discord) return interaction.followUp({ embeds: [createMsg({ color: 'FF0000', title: 'Discord is not linked!', desc: 'Click on **How To Link** for more info.', ephemeral: true })] });
		if (interaction.user.username !== discord.link) return interaction.followUp({ embeds: [createMsg({ color: 'FF0000', desc: '**Discord does not match!**\n_ _\nClick on **How To Link** for more info.', ephemeral: true })] });

		try 
		{
			await db.Link.create({ uuid: player.uuid, dcid: interaction.user.id });
		} 
		catch (error) 
		{
			if (error.code === 11000) return interaction.followUp({ embeds: [createMsg({ desc: '**You are already linked!**' })] });
		}

		try { await interaction.member.setNickname(player.nickname); } 
		catch (e) { if (e.message.includes('Missing Permissions')) { interaction.followUp({ embeds: [createMsg({ color: 'FFA500', desc: '**Silly! I cannot change the nickname of the server owner!**' })] }); console.log(e); } }

		if (config.features.linkRoleToggle) await interaction.member.roles.add(config.features.linkRole);
		if (config.features.guildRoleToggle) 
		{
			const guild = await hypixel.getGuild('player', player.uuid);
			if (guild && guild.name === config.guild) await interaction.member.roles.add(config.features.guildRole);
		}
	}
	catch (e)
	{
		if (e.message === Errors.PLAYER_DOES_NOT_EXIST) { return interaction.followUp({ embeds: [createMsg({ color: 'FF0000', desc: '**Invalid Username!**', ephemeral: true })] }); }
		console.log(e); 
	}

	await interaction.followUp({ embeds: [createMsg({ desc: '<:gcheck:1244687091162415176> **Account linked!**' })], ephemeral: true });
}

async function linkHelpLogic(interaction)
{
	await interaction.reply({ embeds: [linkHelpMsg], ephemeral: true });
}

module.exports = 
{
	linkMsg,
	linkButtons,
	link,
	linkHelpLogic
};