/* eslint-disable indent */

const { createModal, createMsg, createRow } = require('../../helper/builder.js');
const { readConfig, writeConfig } = require('../../helper/configUtils.js');
const { newColors } = require('../../helper/dynamicButtons.js');

const welcomeFeaturesMsg = createMsg({
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

async function setWelcomeChannel(interaction)
{
	const modal = createModal({
		id: 'setWelcomeChannelForm',
		title: 'Set Welcome Channel',
		components: [{
			id: 'setWelcomeChannelInput',
			label: 'CHANNEL ID:',
			style: 'short',
			required: false
		}]
	});
	
	await interaction.showModal(modal);
}

async function setWelcomeMsg(interaction)
{
	const modal = createModal({
		id: 'setwelcomeMsgForm',
		title: 'Set Welcome Msg',
		components: [{
			id: 'setwelcomeMsgInput',
			label: 'WELCOME MESSAGE:',
			style: 'long',
			required: false
		}]
	});
	
	await interaction.showModal(modal);
}

async function setWelcomeRole(interaction)
{
	const modal = createModal({
		id: 'setWelcomeRoleForm',
		title: 'Set Welcome Channel',
		components: [{
			id: 'setWelcomeRoleInput',
			label: 'ROLE ID:',
			style: 'short',
			required: false
		}]
	});
	
	await interaction.showModal(modal);
}

async function setWelcomeChannelLogic(interaction)
{
	const input = interaction.fields.getTextInputValue('setWelcomeChannelInput');
	const channel = await interaction.guild.channels.fetch(input).catch(() => null);
	if (!channel) 
	{ 
		return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid channel ID!**' })], ephemeral: true });
	}
	const data = readConfig();
	data.features.welcomeChannel = input;
	writeConfig(data);
	interaction.reply({ embeds: [createMsg({ desc: `Welcome Channel has been set to **<#${input}>**.` })], ephemeral: true });
}

async function setWelcomeMsgLogic(interaction)
{
	const input = interaction.fields.getTextInputValue('setwelcomeMsgInput');
	const data = readConfig();
	data.features.welcomeMsg = input;
	writeConfig(data);
	let welcomeMsg = data.features.welcomeMsg || `### Welcome to the ${data.guild} server!\n### <@${interaction.user.id}>`;
	welcomeMsg = welcomeMsg.replace(/@member/g, `<@${interaction.user.id}>`);
	interaction.reply({ embeds: [createMsg({ desc: '**Welcome Message has been updated!**' }), createMsg({ desc: welcomeMsg, icon: interaction.user.avatarURL() })], ephemeral: true });
}

async function setWelcomeRoleLogic(interaction)
{
	const input = interaction.fields.getTextInputValue('setWelcomeRoleInput');
	const role = interaction.guild.roles.cache.get(input);
	if (!role) 
	{
		return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**That\'s not a valid role ID!**' })], ephemeral: true });
	}
	if (interaction.member.roles.highest.comparePositionTo(role) <= 0)
	{
		return interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: '**You do not have permission to assign that role!**' })], ephemeral: true });
	}
	const data = readConfig();
	data.features.welcomeRole = input;
	writeConfig(data);
	interaction.reply({ embeds: [createMsg({ desc: `Welcome Role has been set to ${role}.` })], ephemeral: true });
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
	interaction.update({ embeds: [welcomeFeaturesMsg], components: [welcomeMsgButtons, welcomeRoleButtons, back] });
	return true;
}

async function welcomeMsg(member)
{
	const config = readConfig();
	if (!config.features.welcomeMsgToggle) return;

	let welcomeMsg = config.features.welcomeMsg || `### Welcome to the ${config.guild} server!\n### @member`;
    welcomeMsg = welcomeMsg.replace(/@member/g, member.toString());

    const msg = createMsg({
        desc: welcomeMsg,
        icon: member.user.displayAvatarURL()
    });
	const channel = member.guild.channels.cache.get(config.features.welcomeChannel); 

	if (config.features.welcomeMsg.includes('@member'))
	{
		const ghostPing = await channel.send(`||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​|| ${member.toString()}`);
		setTimeout(() => { ghostPing.delete(); }, 1000);
	}
	await channel.send({ embeds: [msg] });
}

async function welcomeRole(member)
{
	const config = readConfig();
	if (!config.features.welcomeRoleToggle) return;
	await member.roles.add(config.features.welcomeRole);
}

module.exports = 
{
	welcome,
	welcomeMsg,
	welcomeRole,
	setWelcomeChannel,
	setWelcomeChannelLogic,
	setWelcomeMsg,
	setWelcomeMsgLogic,
	setWelcomeRole,
	setWelcomeRoleLogic
};