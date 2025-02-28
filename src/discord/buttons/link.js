import { MessageFlags } from 'discord.js';
import { createMsg } from '../../helper.js';

export { linkHelp };

const linkHelp = {
	id: 'linkHelp',

	async execute(interaction) {
		await interaction.reply({
			embeds: [createMsg({
				desc:
					'### How to Link Your Account\n' +
					'1. Connect to __mc.hypixel.net__.\n' +
					'2. Once you\'re in a lobby, click on your head (2nd hotbar slot).\n' +
					'3. Click **Social Media**.\n' +
					'4. Click **Discord**.\n' +
					'5. Type your Discord username into chat.',
				image: 'https://media.discordapp.net/attachments/922202066653417512/1066476136953036800/tutorial.gif'
			})],
			flags: MessageFlags.Ephemeral
		});
	}
};
