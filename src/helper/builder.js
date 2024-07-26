const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { readConfig } = require('./configUtils.js');

const getTimestamp = (date) => { return Math.floor(date.getTime() / 1000); };

const createMsg = ({ color, title, desc, fields, icon, footer, footerIcon, timestamp }) =>
{
	const embed = new EmbedBuilder();
	const { colorTheme } = readConfig();
	
	if (color) embed.setColor(color); else embed.setColor(colorTheme);
	if (title) embed.setTitle(title);
	if (desc) embed.setDescription(desc);
	if (icon) embed.setThumbnail(icon);
	if (footer) embed.setFooter({ text: footer, iconURL: footerIcon });
	if (fields) { fields.forEach(field => 
	{
		embed.addFields({
			name: field.title,
			value: field.desc,
			inline: field.inline || false
		});
	});}
	if (timestamp === 'relative' || timestamp === 'specific') 
	{
		const now = new Date();
		const newTimestamp = `<t:${getTimestamp(now)}:${timestamp === 'relative' ? 'R' : 'f'}>`;
		embed.addFields({
		  name: '\u200B',
		  value: newTimestamp,
		  inline: false
		});
	}
	
	return embed;
};

const styles = 
{
	Blue: ButtonStyle.Primary,
	Gray: ButtonStyle.Secondary,
	Green: ButtonStyle.Success,
	Red: ButtonStyle.Danger,
	Link: ButtonStyle.Link
};

function createButtons({ id, label, style, url }) 
{
	if (url) 
	{
		return new ButtonBuilder()
			.setLabel(label)
			.setURL(url)
			.setStyle(ButtonStyle.Link);
	} 
	else 
	{
		return new ButtonBuilder()
			.setCustomId(id)
			.setLabel(label)
			.setStyle(styles[style]);
	}
}

function createSelectMenu({ id, placeholder, options }) 
{
	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId(id)
		.setPlaceholder(placeholder);

	const selectMenuOptions = options.map(({ value, label, desc }) =>
		new StringSelectMenuOptionBuilder()
			  .setValue(value)
			  .setLabel(label)
			  .setDescription(desc)
		  );

	return selectMenu.addOptions(selectMenuOptions);
}

function createRow(components) 
{
	const actionRow = new ActionRowBuilder();

	components.forEach(config => 
	{
		if (config.label) 
		{ actionRow.addComponents(createButtons(config)); } 

		else if (config.placeholder && config.options) 
		{ actionRow.addComponents(createSelectMenu(config)); } 
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
	createRow,
	createModal
};
