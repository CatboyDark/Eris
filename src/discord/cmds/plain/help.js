import { createMsg } from '../../../helper/builder.js';

export default
{
	name: 'help',

	async execute()
	{
		const embed = createMsg({ desc: '**Super Secret Staff Commands owo**' });
		await message.channel.send({ embeds: [embed] });
	}
};
