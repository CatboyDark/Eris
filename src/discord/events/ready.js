import { readConfig, writeConfig } from '../../helper/utils.js';
import { createMsg, createRow } from '../../helper/builder.js';
import { logGXP } from '../logic/GXP/logGXP.js';
import { Team, Events } from 'discord.js';
import { exec } from 'child_process';
import { schedule } from 'node-cron';
import axios from 'axios';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function updateCheck(client) 
{
	const config = readConfig();
	const channel = await client.channels.fetch(config.logsChannel);
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
		const commitMsg = latestHashResult.data.commit.message;
		if (currentHash !== latestHash) 
		{
			console.warn(`${client.user.username}: Update Available! Run "git pull" to update!`);
		}
		if (config.latestHash !== latestHash)
		{
			const app = await client.application.fetch();
			await channel.send({
				content: `<@${app.owner instanceof Team ? app.owner.ownerId : app.owner.id}>`,
				embeds: [createMsg({ title: 'Update available!', desc: `**Summary:**\n\`${commitMsg}\`` })],
				components: [createRow([{ id: 'update', label: 'Update', style: 'Green' }])]
			});
			config.latestHash = latestHash;
			writeConfig(config);
		}
	}
	catch (error)
	{
		console.error('Error checking for updates:', error);
		await channel.send({ embeds: [createMsg({ title: config.guild, color: 'Red', desc: '**Error checking for updates!**' })] });
	}
}

function updateChecker(client)
{
	updateCheck(client);
	schedule('0 */1 * * *', // Once per hour
		async () => updateCheck(client)
	);
}

async function GXPtracker(client)
{
	schedule( '1 22 * * *', // 00:01 PST every day
		async () => 
		{
			const config = readConfig();
			await logGXP();
			await client.channels.fetch(config.logsChannel).then((channel) => { channel.send({ embeds: [createMsg({ title: config.guild, desc: '**Daily GXP database has been updated!**' })] }); });
		},
		{ timezone: 'America/Los_Angeles' }
	);
}

export default
{
	name: Events.ClientReady,

	async execute(client) 
	{
		updateChecker(client);
		GXPtracker(client);
	}
};
