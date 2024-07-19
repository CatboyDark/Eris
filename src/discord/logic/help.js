const { createMsg, createRow } = require('../../builder');
const { readConfig } = require('../../configUtils');
const { updateHelp } = require('../cmds/slash/help.js');

async function cmds(interaction) 
{
	await updateHelp(interaction);
}

async function mccmds(interaction) 
{
	interaction.update({ embeds: [] });
}

async function credits(interaction) 
{
	const config = readConfig();
	const creditsMsg = createMsg({
		color: config.colorTheme,
		icon: config.guildIcon,
		title: config.guild,
		description:
            '**Credits**\n\n' +
            '✦ <@1165302964093722697> ✦ <@486155512568741900> ✦\n ✦ <@1169174913832202306> ✦ <@622326625530544128> ✦\n',
		footer: 'Created by @CatboyDark',
		footerIcon: 'https://i.imgur.com/4lpd01s.png'
	});

	const buttons = createRow([
		{ id: 'cmds', label: 'Commands', style: 'Primary' },
		{ id: 'credits', label: 'Credits', style: 'Success' },
		{ id: 'support', label: 'Support', style: 'Success' }
	]);

	interaction.update({ embeds: [creditsMsg], components: [buttons] });
}

async function support(interaction) 
{
	const config = readConfig();
	const supportMsg = createMsg({
		color: config.colorTheme,
		icon: config.guildIcon,
		title: config.guild,
		description:
            '**Bugs and Support**\n\n' +
            'Please report any bugs to <@622326625530544128> ❤\n\n' +
            'Source Code: https://github.com/CatboyDark/Eris\n',
		footer: 'Created by @CatboyDark',
		footerIcon: 'https://i.imgur.com/4lpd01s.png'
	});

	const buttons = createRow([
		{ id: 'cmds', label: 'Commands', style: 'Primary' },
		{ id: 'credits', label: 'Credits', style: 'Success' },
		{ id: 'support', label: 'Support', style: 'Success' }
	]);

	interaction.update({ embeds: [supportMsg], components: [buttons] });
}

module.exports = { cmds, mccmds, credits, support };
