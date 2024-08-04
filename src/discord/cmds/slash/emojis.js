const { createMsg, createSlash } = require('../../../helper/builder');

module.exports = createSlash({
	name: 'emojis',
	desc: 'Lists all emojis in the server',

	async execute(interaction) {
		// Defer the reply if the response might take some time
		await interaction.deferReply();

		const guild = interaction.guild;

		// Get the Nitro level and current emoji usage
		const nitroLevel = guild.premiumTier; // Nitro boost level (0, 1, 2, 3)
		const currentEmojis = guild.emojis.cache.size; // Number of custom emojis used

		// Determine the maximum number of emoji slots based on Nitro level
		let maxEmojis;
		switch (nitroLevel) {
		case 3:
			maxEmojis = 250;
			break;
		case 2:
			maxEmojis = 150;
			break;
		case 1:
			maxEmojis = 100;
			break;
		default:
			maxEmojis = 50;
			break;
		}

		// Calculate available emoji slots
		const availableEmojis = maxEmojis - currentEmojis;

		// Create an embed to display the results
		const embed = createMsg({
			title: 'Emoji Slots Info',
			fields: [
				{ title: 'Nitro Level', desc: `Level ${nitroLevel}`, inline: true },
				{ title: 'Total Emoji Slots', desc: maxEmojis.toString(), inline: true },
				{ title: 'Used Emoji Slots', desc: currentEmojis.toString(), inline: true },
				{ title: 'Available Emoji Slots', desc: availableEmojis.toString(), inline: true }
			]
		});

		// Reply with the embed
		await interaction.followUp({ embeds: [embed] });
	}
});