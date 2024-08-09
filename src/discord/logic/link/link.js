const hypixel = require('../../../helper/hapi.js');
const db = require('../../../mongo/schemas.js');
const Errors = require('hypixel-api-reborn');
const { createMsg, createRow, createModal } = require('../../../helper/builder.js');
const { readConfig } = require('../../../helper/configUtils.js');
const getEmoji = require('../../../helper/emojiUtils.js');

async function createLinkMsg() 
{
	const check = await getEmoji('check');

	const linkMsg = createMsg({
		desc:
            `### ${check} Link your Account!\n` +
            'Enter your IGN to connect your Hypixel account.\n\n' +

            '*Please contact a staff member if the bot is down or if you require further assistance.*'
	});

	return linkMsg;
}

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

async function link(interaction)
{
	const check = await getEmoji('check');

	if (!interaction.isModalSubmit()) return interaction.showModal(modal); 

	await interaction.deferReply({ ephemeral: true });

	const input = interaction.fields.getTextInputValue('linkInput');

	try
	{
		const config = readConfig();

		const player = await hypixel.getPlayer(input);
		const discord = await player.socialMedia.find(media => media.id === 'DISCORD');
		if (!discord) return interaction.followUp({ embeds: [createMsg({ color: 'FF0000', desc: '**Discord is not linked!**\n_ _\nClick on **How To Link** for more info.' })] });
		if (interaction.user.username !== discord.link) return interaction.followUp({ embeds: [createMsg({ color: 'FF0000', desc: '**Discord does not match!**\n_ _\nClick on **How To Link** for more info.' })] });

		try 
		{
			await db.Link.create({ uuid: player.uuid, dcid: interaction.user.id });
		} 
		catch (error) 
		{
			if (error.code === 11000) return interaction.followUp({ embeds: [createMsg({ desc: `${check} **You are already linked!**` })] });
		}

		try 
		{ 
			await interaction.member.setNickname(player.nickname); 
		} 
		catch (e) 
		{ 
			if (e.message.includes('Missing Permissions')) 
			{ 
				// interaction.followUp({ embeds: [createMsg({ color: 'FFA500', desc: '**Silly! I cannot change the nickname of the server owner!**' })] }); 
				// console.log('Silly! I cannot change the nickname of the server owner!'); 
			} 
		}

		if (config.features.linkRoleToggle) await interaction.member.roles.add(config.features.linkRole);
		if (config.features.guildRoleToggle) 
		{
			const guild = await hypixel.getGuild('player', player.uuid);
			if (guild && guild.name === config.guild) await interaction.member.roles.add(config.features.guildRole);
		}
	}
	catch (e)
	{
		if (e.message === Errors.PLAYER_DOES_NOT_EXIST) { return interaction.followUp({ embeds: [createMsg({ color: 'FF0000', desc: '**Invalid Username!**' })] }); }
		console.log(e); 
	}

	await interaction.followUp({ embeds: [createMsg({ desc: `${check} **Account linked!**` })] });
}

async function linkHelpLogic(interaction)
{
	await interaction.reply({ embeds: [linkHelpMsg] });
}

module.exports = 
{
	createLinkMsg,
	linkButtons,
	link,
	linkHelpLogic
};