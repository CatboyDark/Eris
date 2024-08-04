const { createMsg, createRow } = require('../../../helper/builder.js');
const { readConfig } = require('../../../helper/configUtils.js');
const { newColors } = require('../../../helper/dynamicButtons.js');

const welcomeMsg = createMsg({
	title: 'Welcome',
	desc:
		'1. **Welcome Message**\n' +
		'Send a message when a member joins your Discord server.\n' +
		'If you do not provide a message, a default will be used.\n' +
		'*You may enter \'@member\' to ping the member.*\n\n' + 

		'2. **Welcome Role**\n' +
		'Assign members a role when they join your Discord server.\n\n' +

		'3. **Remove Role On Link**\n' +
		'You may also choose to remove the Welcome Role on linking their Hypixel account.\n' +
		'This is useful if you want members to link before they can access your server.'
});

async function createButtons(interaction) 
{
	const color = await newColors(interaction);

	const welcomeMsgButtons = createRow([
		{ id: 'welcomeMsgToggle', label: 'Toggle Welcome Message', style: color['welcomeMsgToggle'] },
		{ id: 'setWelcomeChannel', label: 'Set Channel', style: 'Blue' },
		{ id: 'setwelcomeMsg', label: 'Set Message', style: 'Blue' }
	]);

	const welcomeRoleButtons = createRow([
		{ id: 'welcomeRoleToggle', label: 'Toggle Welcome Role', style: color['welcomeRoleToggle'] },
		{ id: 'setWelcomeRole', label: 'Set Role', style: 'Blue' },
		{ id: 'removeRoleOnLink', label: 'Remove Role On Link', style: color['removeRoleOnLink'] }
	]);

	const back = createRow([
		{ id: 'backToFeatures', label: 'Back', style: 'Gray' }
	]);

	return { welcomeMsgButtons, welcomeRoleButtons, back };
}

async function welcome(interaction)
{
	const config = await readConfig();

	switch (interaction.customId) 
	{
	case 'welcomeMsgToggle':
		if (!config.features.welcomeChannel) 
		{
			await interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**You need to set a Welcome Channel first!**' })], ephemeral: true });
			return false;
		}
		break;

	case 'welcomeRoleToggle':
		if (!config.features.welcomeRole) 
		{
			await interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**You need to set a Welcome Role first!**' })], ephemeral: true });
			return false;
		}
		break;

	case 'removeRoleOnLink':
		if (!config.features.welcomeRoleToggle) 
		{
			await interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**You don\'t have Welcome Role enabled!**' })], ephemeral: true });
			return false;
		}
		if (!config.features.welcomeRole)
		{
			await interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**You need to set a Welcome Role first!**' })], ephemeral: true });
			return false;
		}
		break;
	}
	
	const { welcomeMsgButtons, welcomeRoleButtons, back } = await createButtons(interaction);
	interaction.update({ embeds: [welcomeMsg], components: [welcomeMsgButtons, welcomeRoleButtons, back] });
	return true;
}

module.exports =
{
	welcome
};