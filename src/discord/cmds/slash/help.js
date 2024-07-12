const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { staffRole, guild, guildIcon } = require('../../../../config.json');
const fs = require('fs');
const path = require('path');

function loadCmds() {
	const commandFilesDir = __dirname;

	return fs.readdirSync(commandFilesDir)
		.map(file => require(path.join(commandFilesDir, file)))
		.filter(command => command && command.type && command.data);
}

module.exports = 
{
	type: 'slash',
	staff: false,
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Show bot info'),
		
	async execute(interaction) 
	{
		const commands = loadCmds();
		const roles = interaction.member.roles.cache;
		const isStaff = roles.some(role => staffRole.includes(role.id));
		
		const embed = new EmbedBuilder()
			.setColor('000000')
			.setThumbnail(guildIcon)
			.setTitle(guild)
			.addFields(
				{
					name: '**Commands**',
					value: commands
						.filter(cmd => isStaff || !cmd.staff)
						.sort((a, b) => a.data.name.localeCompare(b.data.name))
						.map(cmd => `* **\`/${cmd.data.name}\`** ${cmd.data.description}`)
						.join('\n')
				},
				{
					name: '**Credits**',
					value: '✦ <@1165302964093722697> ✦ <@486155512568741900> ✦ <@1169174913832202306> ✦ <@622326625530544128> ✦'
				},
				{
					name: '**Bugs and Support**',
					value: '[Github](https://github.com/CatboyDark/WristSpasm-Reborn)'
				}
			)
			.setFooter({
				text: 'Created by @CatboyDark',
				iconURL: 'https://i.imgur.com/4lpd01s.png'
			});

		await interaction.reply({ embeds: [embed] });
	}
};
