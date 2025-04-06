import { MessageFlags } from 'discord.js';
import { createMsg } from '../../utils/utils.js';
import fs from 'fs';

const links = JSON.parse(fs.readFileSync('./assets/links.json', 'utf8'));

const buttons = links.map(data => ({
    id: data.id,
    execute: async (interaction) => {
		const response = {
			content: data.url,
			flags: MessageFlags.Ephemeral
		};

        if (data.note) {
            response.embeds = [createMsg({ desc: data.note })];
        }

        interaction.reply(response);
    }
}));

export default buttons;
