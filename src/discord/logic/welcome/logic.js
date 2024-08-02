/* eslint-disable indent */

const { createMsg } = require('../../../helper/builder.js');
const { readConfig, writeConfig } = require('../../../helper/configUtils.js');

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
	welcomeMsg,
	welcomeRole,
	setWelcomeChannelLogic,
	setWelcomeMsgLogic,
	setWelcomeRoleLogic
};