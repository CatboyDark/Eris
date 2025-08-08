import { createMsg } from '../../utils/utils.js';

const buttons =	[
	{ id: 'DCcmds', label: 'Discord Commands', color: 'Green' },
	{ id: 'MCcmds', label: 'Minecraft Commands', color: 'Green' },
	{ id: 'support', label: 'Support', color: 'Blue' },
	{ label: 'Source', url: 'https://github.com/CatboyDark/Eris' }
];

const mcCommandInfo = {
	'level': { title: 'Level', aliases: ['l', 'lv'], example: 'CatboyDark: Cata 59.9 | Class Avg 50.6 (➶50, ⚡51, ☄50, ⚓50, ⚚50) | Secrets: 156k (9.3 S/R)' },
	
};

export default [
	{
		id: 'DCcmds',

		async execute(interaction) {
			interaction.update(createMsg([
				{
					embed: [{
						desc: '### Discord Commands\n'
					}]
				},
				buttons
			]));
		}
	},
	{
		id: 'MCcmds',

		async execute(interaction) {
			interaction.update(createMsg([
				{
					embed: [{
						desc: mcCommands
					}]
				},
				buttons
			]));
		}
	},
	{
		id: 'support',

		async execute(interaction) {
			interaction.update(createMsg([
				{
					embed: [{ desc:
						'### Support\n' +
						'For bot support, suggestions, or bug reports, please contact @catboydark ❤'
					}]
				},
				buttons
			]));
		}
	}
];

