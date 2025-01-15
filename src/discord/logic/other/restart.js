import { exec } from 'child_process';
import { promisify } from 'util';
import { createMsg } from '../../../helper/builder.js';
import axios from 'axios';
import { readConfig } from '../../../helper/utils.js';

const execPromise = promisify(exec);

async function restart(client)
{
	try
	{
		await execPromise('git update-index --skip-worktree README.md');
		await execPromise('git pull');

		await client.destroy();

		await execPromise('node start.js');
	}
	catch (error)
	{
		console.error('Error during restart:', error);
		throw error;
	}
}

async function update(interaction)
{
	const config = readConfig();
	await interaction.deferReply();

	try
	{
		const [latestHashResult, localHashResult] = await Promise.all([
			axios.get('https://api.github.com/repos/CatboyDark/Eris/commits/main', {
				headers: { Accept: 'application/vnd.github.v3+json' }
			}),
			execPromise('git rev-parse --short HEAD')
		]);

		const latestHash = latestHashResult.data.sha.substring(0, 7);
		const currentHash = localHashResult.stdout.trim();

		if (currentHash === latestHash)
		{
			return interaction.followUp({ embeds: [createMsg({ desc: `** ${interaction.client.user.username} is already up to date!**` })], ephemeral: true });
		}
	}
	catch (error)
	{
		console.error('Error checking for updates:', error);
		return interaction.followUp({ embeds: [createMsg({ title: config.guild, color: 'Red', desc: '**Error checking for updates!**' })] });
	}

	await restart(interaction.client);
	await interaction.followUp({ embeds: [createMsg({ desc: `**${interaction.client.user.username} has been updated!**` })] });
}

export 
{
	restart,
	update
};
