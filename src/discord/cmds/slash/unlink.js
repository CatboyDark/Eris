const { createSlash, createMsg } = require('../../../helper/builder.js');
const { readConfig } = require('../../../helper/configUtils.js');
const { Link } = require('../../../mongo/schemas.js');

module.exports = createSlash({
	name: 'unlink',
	desc: 'Unlink your discord',
		
	async execute(interaction) 
	{
		const result = await Link.findOneAndDelete({ dcid: interaction.user.id });

		if (result) 
		{
			await interaction.reply({ embeds: [createMsg({ desc: '**You are now unlinked!**' })], ephemeral: true });

			const config = readConfig();
			if (config.features.linkRoleToggle)
			{
				const member = await interaction.guild.members.fetch(interaction.user.id);
				if(member.roles.cache.has(config.features.linkRole)) await member.roles.remove(config.features.linkRole);
			}
		} 
		else 
		{
			await interaction.reply({ embeds: [createMsg({ color: 'FF0000', desc: 'You are not linked!' })], ephemeral: true });
		}
	}
});