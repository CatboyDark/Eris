import { exec } from 'child_process';
import { createMsg } from '../../../helper/builder.js';

const errors = (error, stderr) =>
{
	if (error)
	{
		console.log(`Error: ${error.message}`);
		return;
	}
	if (stderr)
	{
		console.log(`STD Error: ${stderr}`);
		return;
	}
};

export default
{
	name: 'stop',
	desc: 'Kills the bot',
	permissions: ['Administrator'],

	async execute(interaction) 
	{
		exec('pm2 stop Eris', errors);

		await interaction.reply({ embeds: [createMsg({ desc: '**Stopping...**' })], ephemeral: true });
	}
};
