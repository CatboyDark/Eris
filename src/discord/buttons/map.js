import { MessageFlags } from 'discord.js';
import fs from 'fs';
import { createMsg } from '../../utils/utils.js';

const links = JSON.parse(fs.readFileSync('./assets/resource_links.json', 'utf8'));

const buttons = links.map(data => ({
    id: data.id,
    execute: async (interaction) => {
		const response = {
			content: data.url,
			flags: MessageFlags.Ephemeral
		};

        if (data.note) {
            response.embeds = [createMsg.old({ desc: data.note })];
        }

        interaction.reply(response);
    }
}));

export default buttons;
