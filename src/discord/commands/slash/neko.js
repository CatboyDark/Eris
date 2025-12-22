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
		const nsfw = interaction.options.getString('nsfw');
		if (nsfw) {
			return await interaction.reply('https://tenor.com/view/vorzek-vorzneck-oglg-og-lol-gang-gif-24901093')
		}

		const response = await fetch(`https://nekos.moe/api/v1/random/image?nsfw=false&count=1`)
		const data = await response.json()

		await interaction.reply(createMsg([[{ img: `https://nekos.moe/image/${data.images[0].id}` }]]))
	}
};
