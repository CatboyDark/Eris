import { createMsg } from '../../../utils/utils.js';

export default {
	name: 'poke',
	desc: 'Test your Pokemon knowledge!',

	async execute(interaction) {
		const msg = createMsg([
			{
				embed: [
					{ desc: '### Quiz Time!' },
					[{ img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/250px-International_Pok%C3%A9mon_logo.svg.png' }],
					{ desc: '**Players**\n- CatboyDark\n - ancientone649' }
				]
			},
			[
				{ id: 'a', label: 'Options', color: 'Green' },
				{ id: 'b', label: 'Join Game', color: 'Blue' },
				{ id: 'c', label: 'Start', color: 'Blue' }
			]
		]);
		interaction.reply(msg);
	}
};
