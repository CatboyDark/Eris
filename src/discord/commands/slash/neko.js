import { createMsg } from '../../../utils/utils.js';

export default {
	name: 'neko',
	desc: 'nyaaa~',
	options: [
		{ type: 'string', name: 'nsfw', desc: 'NSFW', required: false,
			choices: [
				{ name: 'true', value: 'true' }
			]
		}
	],

	async execute(interaction) {
		const nsfw = interaction.options.getString('nsfw') ?? false;

		const response = await fetch(`https://nekos.moe/api/v1/random/image?nsfw=${nsfw}&count=1`)
		const data = response.json()

		await interaction.reply(createMsg([[{ img: `https://nekos.moe/image/${data.images[0].id}` }]]))
	}
};
