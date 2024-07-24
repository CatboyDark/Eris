const { createMsg, createRow } = require('../../builder.js');
const { readConfig } = require('../../configUtils.js');
const fs = require('fs');
const path = require('path');

async function createHelpMsg(interaction)
{
	const config = readConfig();

	const cmdsDirectory = path.join(__dirname, '..', 'cmds', 'slash');
	const cmds = fs.readdirSync(cmdsDirectory)
		.map(file => require(path.join(cmdsDirectory, file)))
		.filter(command => command && command.type && command.data);

	const isStaff = interaction.member.roles.cache.some(role => config.staffRole.includes(role.id));

	const formatCommands = (staffOnly = false) =>
		cmds
			.filter(cmd => staffOnly ? cmd.staff : !cmd.staff)
			.sort((a, b) => a.data.name.localeCompare(b.data.name))
			.map(cmd => `* **\`/${cmd.data.name}\`** ${cmd.data.description}`);

	const nonCommands = `**Commands**\n${formatCommands()}`;
	const staffCommands = isStaff ? `\n\n**Staff**\n${formatCommands(true)}` : '';

	return createMsg({
		icon: config.guildIcon,
		title: config.guild,
		desc: `${nonCommands}${staffCommands}`,
		footer: 'Created by @CatboyDark',
		footerIcon: 'https://i.imgur.com/4lpd01s.png'
	});
}

const helpButtons = createRow([
	{id: 'mccmds', label: 'Ingame Commands', style: 'Blue'},
	{id: 'credits', label: 'Credits', style: 'Green'},
	{id: 'support', label: 'Support', style: 'Green'},
	{label: 'GitHub', url: 'https://github.com/CatboyDark/Eris'}
]);

async function cmds(interaction) 
{
	const embed = await createHelpMsg(interaction);
	await interaction.update({ embeds: [embed], components: [helpButtons] });
}

async function mccmds(interaction) 
{
	interaction.update({ embeds: [] });
}

async function credits(interaction) 
{
	const config = readConfig();
	const creditsMsg = createMsg({
		icon: config.guildIcon,
		title: config.guild,
		desc:
            '**Credits**\n\n' +
            '✦ <@1165302964093722697> ✦ <@486155512568741900> ✦\n ✦ <@1169174913832202306> ✦ <@622326625530544128> ✦\n',
		footer: 'Created by @CatboyDark',
		footerIcon: 'https://i.imgur.com/4lpd01s.png'
	});

	const buttons = createRow([
		{ id: 'cmds', label: 'Commands', style: 'Blue' },
		{ id: 'credits', label: 'Credits', style: 'Green' },
		{ id: 'support', label: 'Support', style: 'Green' },
		{label: 'GitHub', url: 'https://github.com/CatboyDark/Eris'}
	]);

	interaction.update({ embeds: [creditsMsg], components: [buttons] });
}

async function support(interaction) 
{
	const config = readConfig();
	const supportMsg = createMsg({
		icon: config.guildIcon,
		title: config.guild,
		desc:
            '**Bugs and Support**\n\n' +
            'You may contact <@622326625530544128> for support. ❤\n' +
            'To report any bugs or suggestions, check out our GitHub!\n',
		footer: 'Created by @CatboyDark',
		footerIcon: 'https://i.imgur.com/4lpd01s.png'
	});

	const buttons = createRow([
		{ id: 'cmds', label: 'Commands', style: 'Blue' },
		{ id: 'credits', label: 'Credits', style: 'Green' },
		{ id: 'support', label: 'Support', style: 'Green' },
		{label: 'GitHub', url: 'https://github.com/CatboyDark/Eris'}
	]);

	interaction.update({ embeds: [supportMsg], components: [buttons] });
}

module.exports = { createHelpMsg, helpButtons, cmds, mccmds, credits, support };
