const { createMsg } = require('../../../builder.js');

module.exports = 
{
	type: 'plain',
	name: '.h',

	async execute(message) 
	{
		const embed = createMsg({
			description: '**Secret Staff Commands**'
		});
		
		await message.channel.send({ embeds: [embed] });
	}
};