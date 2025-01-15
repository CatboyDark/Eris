import { createMsg, createRow } from '../../../helper/builder.js';
import { readConfig, toggleConfig } from '../../../helper/utils.js';

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

function createButtons()
{
	const config = readConfig();

	const welcomeMsgButtons = createRow([
		{
			id: 'welcomeMsgToggle',
			label: 'Enable Welcome Message',
			style: config.features.welcomeMsgToggle
		},
		{ id: 'setWelcomeChannel', label: 'Set Channel', style: 'Blue' },
		{ id: 'setWelcomeMsg', label: 'Set Message', style: 'Blue' }
	]);

	const welcomeRoleButtons = createRow([
		{
			id: 'welcomeRoleToggle',
			label: 'Enable Welcome Role',
			style: config.features.welcomeRoleToggle
		},
		{ id: 'setWelcomeRole', label: 'Set Role', style: 'Blue' },
		{
			id: 'removeRoleOnLink',
			label: 'Remove Role On Link',
			style: config.features.removeRoleOnLink
		}
	]);

	const back = createRow([{ id: 'features', label: 'Back', style: 'Gray' }]);

	return { welcomeMsgButtons, welcomeRoleButtons, back };
}

async function welcome(interaction)
{
	const config = await readConfig();
	const noWelcomeRole = createMsg({ color: 'Red', desc: '**You need to set a Welcome Role first!**' });

	switch (interaction.customId)
	{
		case 'welcomeMsgToggle':
			if (!config.features.welcomeChannel)
			{
				await interaction.reply({ embeds: [createMsg({ color: 'Red', desc: '**You need to set a Welcome Channel first!**' })], ephemeral: true });
				return false;
			}
			toggleConfig('features.welcomeMsgToggle');
			break;

		case 'welcomeRoleToggle':
			if (!config.features.welcomeRole)
			{
				await interaction.reply({ embeds: [noWelcomeRole], ephemeral: true });
				return false;
			}
			toggleConfig('features.guildRoleToggle');
			break;

		case 'removeRoleOnLink':
			if (!config.features.welcomeRoleToggle)
			{
				await interaction.reply({ embeds: [noWelcomeRole], ephemeral: true });
				return false;
			}
			if (!config.features.welcomeRole)
			{
				await interaction.reply({ embeds: [noWelcomeRole], ephemeral: true });
				return false;
			}
			break;
	}

	const { welcomeMsgButtons, welcomeRoleButtons, back } = createButtons();
	interaction.update({ embeds: [welcomeMsg], components: [welcomeMsgButtons, welcomeRoleButtons, back] });
	return true;
}

export default 
{
	welcome
};
