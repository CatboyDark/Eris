import { mcCommands } from '../../../minecraft/Minecraft.js';
import { createMsg } from '../../../utils/utils.js';
export default {
	name: 'help',
	desc: 'Display bot info',

	async execute(interaction) {
		const message = createMsg([
			{
				embed: [{
					desc: ''
				}]
			},
			[
				{ id: 'DCcmds', label: 'Discord Commands', color: 'Green' },
				{ id: 'MCcmds', label: 'Minecraft Commands', color: 'Green' },
				{ id: 'support', label: 'Support', color: 'Blue' },
				{ label: 'Source', url: 'https://github.com/CatboyDark/Eris' }
			]
		]);
		interaction.reply('e');
	}
};
