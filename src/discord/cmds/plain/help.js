import { createMsg } from '../../../helper/builder.js';

export const name = 'help';

export async function execute(message) 
{
	const embed = createMsg({
		desc: '**Super Secret Staff Commands owo**'
	});

	await message.channel.send({ embeds: [embed] });
}
