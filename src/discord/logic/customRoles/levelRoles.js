const { createMsg, createRow, createModal } = require('../../../helper/builder.js');
const { readConfig, writeConfig } = require('../../../helper/utils.js');

const levelRolesMsg = createMsg({
	title: 'Custom Roles: Level',
	desc: 
		'Assign roles based on the user\'s Skyblock level.\n\n' +
		'*Note: You do not need to assign a role to every level.*'
});

const back = createRow([
	{ id: 'customRoles', label: 'Back', style: 'Gray' }
	// { id: 'createLevelRoles', label: 'Generate New Roles', style: 'Green' }
]);

const levels = 
[
	{ id: 'level0', label: 'Level [0]', desc: '0-39' },
	{ id: 'level40', label: 'Level [40]', desc: '40-79' },
	{ id: 'level80', label: 'Level [80]', desc: '80-119' },
	{ id: 'level120', label: 'Level [120]', desc: '120-159' },
	{ id: 'level160', label: 'Level [160]', desc: '160-199' },
	{ id: 'level200', label: 'Level [200]', desc: '200-239' },
	{ id: 'level240', label: 'Level [240]', desc: '240-279' },
	{ id: 'level280', label: 'Level [280]', desc: '280-319' },
	{ id: 'level320', label: 'Level [320]', desc: '320-359' },
	{ id: 'level360', label: 'Level [360]', desc: '360-399' },
	{ id: 'level400', label: 'Level [400]', desc: '400-439' },
	{ id: 'level440', label: 'Level [440]', desc: '440-479' },
	{ id: 'level480', label: 'Level [480]', desc: '480-520' }
];

const levelRolesMenu = createRow([
	{
	  id: 'levelRolesMenu',
	  placeholder: 'Setup existing roles',
	  options: levels.map(option => ({
			value: option.id,
			label: option.label,
			desc: option.desc
	  }))
	}
]);

async function createLevelRoles(interaction) 
{
	if (interaction.isStringSelectMenu()) 
	{
		const selectedOption = interaction.values[0];

		const level = levels.find(l => l.id === selectedOption);
    
		const modal = createModal({
			id: `${selectedOption}Form`,
			title: `${level.label} Role`,
			components: [{
				id: `${selectedOption}Input`,
				label: `ENTER ROLE ID FOR ${level.label}:`,
				style: 'short',
				required: true
			}]
		});
    
		await interaction.showModal(modal);
	}

	if (interaction.isModalSubmit()) 
	{
		const selectedOption = interaction.customId.replace('Form', '');
		const input = interaction.fields.getTextInputValue(`${selectedOption}Input`);

		const role = interaction.guild.roles.cache.get(input);
		if (!role) return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid Role ID!**' })], ephemeral: true });

		const levelNumber = selectedOption.replace('level', '');

		levelRoles[levelNumber] = input;

		const config = readConfig();
		config.levelRoles[levelNumber] = input;
		writeConfig(config);

		await interaction.reply({ embeds: [createMsg({ desc: `**${levels.find(l => l.id === selectedOption).label} has been set to** <@&${input}>` })], ephemeral: true });
	}
}

async function levelRoles(interaction)
{
	await interaction.update({ embeds: [levelRolesMsg], components: [levelRolesMenu, back] });
}

module.exports = 
{
	createLevelRoles,
	levelRoles
};