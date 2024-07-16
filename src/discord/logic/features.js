const { createMsg } = require('../../builder.js');

const featuresEmbed = createMsg({
	description: '**Secret Staff Commands**'
});

async function features(interaction)
{
	await interaction.update({ embeds: [featuresEmbed], components: [] });
}

module.exports = { features };