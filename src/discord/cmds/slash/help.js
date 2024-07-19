const { SlashCommandBuilder } = require('discord.js');
const { createMsg, createRow } = require('../../../builder.js');
const { readConfig } = require('../../../configUtils.js');
const fs = require('fs');
const path = require('path');

function loadCmds()
{
	const commandFilesDir = __dirname;

	return fs.readdirSync(commandFilesDir)
		.map(file => require(path.join(commandFilesDir, file)))
		.filter(command => command && command.type && command.data);
}

const buttons = createRow([
	{id: 'mccmds', label: 'Ingame Commands', style: 'Primary'},
	{id: 'credits', label: 'Credits', style: 'Success'},
	{id: 'support', label: 'Support', style: 'Success'}
]);

const formatCommands = (cmds, staffOnly = false) =>
	cmds.filter(cmd => staffOnly ? cmd.staff : !cmd.staff)
		.sort((a, b) => a.data.name.localeCompare(b.data.name))
		.map(cmd => `* **\`/${cmd.data.name}\`** ${cmd.data.description}`);

async function help(interaction)
{
	const config = readConfig();
	const cmds = loadCmds();
	const roles = interaction.member.roles.cache;
	const isStaff = roles.some(role => config.staffRole.includes(role.id));
		  
	const nonCommands = `**Commands**\n${formatCommands(cmds)}`;
	const staffCommands = isStaff ? `\n\n**Staff**\n${formatCommands(cmds, true)}` : '';
		  
	const embed = createMsg({
			  color: config.colorTheme,
			  icon: config.guildIcon,
			  title: config.guild,
			  description: `${nonCommands}${staffCommands}`,
			  footer: 'Created by @CatboyDark',
			  footerIcon: 'https://i.imgur.com/4lpd01s.png'
	});
		  
	await interaction.update({ embeds: [embed], components: [buttons] });
}

module.exports = 
{
	help,

	type: 'slash',
	staff: false,
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Show bot info'),
		
	async execute(interaction) 
	{
		help(interaction);
	}
};
