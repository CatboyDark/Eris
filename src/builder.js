const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { readConfig } = require('./configUtils.js');

const createMsg = ({ color, title, description, thumbnail }) =>
{
	const embed = new EmbedBuilder();
	const config = readConfig();

	if (color) embed.setColor(color);
	else embed.setColor(config.colorTheme);

	if (title) embed.setTitle(title);
	if (description) embed.setDescription(description);
	if (thumbnail) embed.setThumbnail(thumbnail);

	return embed;
};

function createButtons({ id, label, style }) 
{
	let buttonStyle;
	switch (style.toLowerCase()) 
	{
	case 'primary':
		buttonStyle = ButtonStyle.Primary;
		break;
	case 'secondary':
		buttonStyle = ButtonStyle.Secondary;
		break;
	case 'success':
		buttonStyle = ButtonStyle.Success;
		break;
	case 'danger':
		buttonStyle = ButtonStyle.Danger;
		break;
	case 'link':
		buttonStyle = ButtonStyle.Link;
		break;
	default:
		throw new Error(`Invalid Button Style! ${style}`);
	}

	return new ButtonBuilder()
		.setCustomId(id)
		.setLabel(label)
		.setStyle(buttonStyle);
}

function createRow(buttonConfigs) 
{
	const actionRow = new ActionRowBuilder();

	buttonConfigs.forEach(buttonConfig => 
	{
		actionRow.addComponents(createButtons(buttonConfig));
	});

	return actionRow;
}

function createModal({ id, title, components })
{
	const modal = new ModalBuilder()
		.setCustomId(id)
		.setTitle(title);

	components.forEach(component => 
	{
		let textInputStyle;
		switch (component.style.toLowerCase()) 
		{
		case 'short':
			textInputStyle = TextInputStyle.Short;
			break;
		case 'long':
			textInputStyle = TextInputStyle.Paragraph;
			break;
		default:
			throw new Error(`Invalid Text Input Style! ${component.style}`);
		}
	
		const textInput = new TextInputBuilder()
			.setCustomId(component.id)
			.setLabel(component.label)
			.setStyle(textInputStyle)
			.setRequired(component.required);

		if (component.length) 
		{
			const [minLength, maxLength] = component.length.split(' ').map(num => parseInt(num));
			textInput.setMinLength(minLength).setMaxLength(maxLength);
			
			if (isNaN(minLength) || isNaN(maxLength)) 
			{ throw new Error(`Invalid length format: ${component.length}`); }
		}
	
		modal.addComponents(new ActionRowBuilder().addComponents(textInput));
	});

	return modal;
}

module.exports =
{
	createMsg,
	createButtons,
	createRow,
	createModal
};
