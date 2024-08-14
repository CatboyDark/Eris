const { createMsg, createRow, createModal } = require('../../../helper/builder.js');
const { readConfig, writeConfig } = require('../../../helper/utils.js');

const back = createRow([
	{ id: 'customRoles', label: 'Back', style: 'Gray' },
	{ id: 'createCataRoles', label: 'Create Roles', style: 'Green' },
	{ id: 'deleteCataRoles', label: 'Delete Roles', style: 'Red' }
]);

function createCataRolesMsg() 
{
	const config = readConfig();
	if (Object.keys(config.cataRoles).length === 0) 
		return createMsg({ title: 'Custom Roles: Cata', desc: 'You may assign a role to any Catacombs level.' });

	const roleList = Object.entries(config.cataRoles)
		.map(([level, roleID]) => `<@&${roleID}> - **Cata ${level}**`)
		.join('\n');

	return createMsg({ title: 'Custom Roles: Cata', desc: `You may assign a role to any Catacombs level.\n### Roles:\n${roleList}` });
}

async function createCataRoles(interaction)
{
	if (interaction.isButton()) 
	{
		const modal = createModal({
			id: 'createCataRolesForm',
			title: 'Create Cata Role',
			components: [
				{
					id: 'cataInput',
					label: 'ENTER A CATA LEVEL (0-50):',
					style: 'short',
					required: true
				},
				{
					id: 'cataRoleInput',
					label: 'ENTER A ROLE ID:',
					style: 'short',
					required: true
				}
			]
		});
		
		await interaction.showModal(modal);
	}

	if (interaction.isModalSubmit())
	{
		const cataInput = interaction.fields.getTextInputValue('cataInput');
		const cataRole = interaction.fields.getTextInputValue('cataRoleInput');

		if (cataInput < 0 || cataInput > 50) return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid Cata level!**' })], ephemeral: true });
		const role = interaction.guild.roles.cache.get(cataRole);
		if (!role) return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid Role ID!**' })], ephemeral: true });

		const config = readConfig();
		config.cataRoles[cataInput] = cataRole;
		writeConfig(config);

		await interaction.update({ embeds: [createCataRolesMsg()] });
	}
}

async function deleteCataRoles(interaction)
{
	if (interaction.isButton()) 
	{
		const modal = createModal({
			id: 'deleteCataRolesForm',
			title: 'Remove Cata Role',
			components: [{
				id: 'cataRemoveInput',
				label: 'ENTER A CATA TO REMOVE (0-50):',
				style: 'short',
				required: true
			}]
		});
			
		await interaction.showModal(modal);
	}

	if (interaction.isModalSubmit())
	{
		const cataRemoveInput = interaction.fields.getTextInputValue('cataRemoveInput');

		const config = readConfig();
        
		if (cataRemoveInput >= 0 || cataRemoveInput <= 50)
		{
			if (config.cataRoles[cataRemoveInput]) 
			{
				delete config.cataRoles[cataRemoveInput];
				writeConfig(config);
			}
			else return interaction.reply({ embeds: [createMsg({ desc: `You don\'t have a role set for **Catacombs Level ${cataRemoveInput}**!` })], ephemeral: true });

			await interaction.update({ embeds: [createCataRolesMsg()] });
		}

		else return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid Catacombs level!**' })], ephemeral: true });
	}
}

async function cataRoles(interaction)
{
	await interaction.update({ embeds: [createCataRolesMsg()], components: [back] });
}

module.exports =
{
	cataRoles,
	createCataRoles,
	deleteCataRoles
};