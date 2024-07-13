const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, ModalBuilder } = require('discord.js');
const { colorTheme } = require('../../../config.json');
const fs = require('fs');

const featuresEmbed = new EmbedBuilder().setColor(colorTheme).setDescription(
	'### Features'
);

async function features(interaction)
{
	await interaction.update({ embeds: [featuresEmbed], components: [] });
}

module.exports = { features };