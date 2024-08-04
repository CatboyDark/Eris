const { createModal, createMsg } = require('../../../helper/builder.js');
const { readConfig, writeConfig } = require('../../../helper/configUtils.js');

async function setWelcomeMsg(interaction)
{
	if (!interaction.isModalSubmit())
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
	
		return interaction.showModal(modal);
	}

	const input = interaction.fields.getTextInputValue('setwelcomeMsgInput');
	const data = readConfig();
	data.features.welcomeMsg = input;
	writeConfig(data);
	let welcomeMsg = data.features.welcomeMsg || `### Welcome to the ${data.guild} server!\n### <@${interaction.user.id}>`;
	welcomeMsg = welcomeMsg.replace(/@member/g, `<@${interaction.user.id}>`);
	interaction.reply({ embeds: [createMsg({ desc: '**Welcome Message has been updated!**' }), createMsg({ desc: welcomeMsg, icon: interaction.user.avatarURL() })], ephemeral: true });
}

module.exports = 
{
	setWelcomeMsg
};