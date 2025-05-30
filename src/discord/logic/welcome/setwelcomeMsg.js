import { createForm, createMsg } from '../../../helper/builder.js';
import { readConfig, writeConfig } from '../../../helper/utils.js';

async function setWelcomeMsg(interaction) {
	if (!interaction.isModalSubmit()) {
		const modal = createForm({
			id: 'setwelcomeMsgForm',
			title: 'Set Welcome Msg',
			components: [
				{
					id: 'setwelcomeMsgInput',
					label: 'WELCOME MESSAGE:',
					style: 'long',
					required: false
				}
			]
		});

		return interaction.showModal(modal);
	}

	const input = interaction.fields.getTextInputValue('setwelcomeMsgInput');
	const config = readConfig();
	config.features.welcomeMsg = input;
	writeConfig(config);

	let welcomeMsg = config.features.welcomeMsg || `### Welcome to the ${config.guild} server!\n### <@${interaction.user.id}>`;
	welcomeMsg = welcomeMsg.replace(/@member/g, `<@${interaction.user.id}>`);

	interaction.reply({ embeds: [
			createMsg({ desc: '**Welcome Message has been updated!**' }),
			createMsg({ desc: welcomeMsg, icon: interaction.user.avatarURL() })
		], ephemeral: true
	});
}

export default 
{
	setWelcomeMsg
};
