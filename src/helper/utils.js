const hypixel = require('./hapi.js');
const { appID, token } = require('../../config.json');
const fs = require('fs');
const path = require('path');
const configs = path.join(__dirname, '../../config.json');

function readConfig()
{
	return JSON.parse(fs.readFileSync(configs, 'utf8'));
}

function writeConfig(newConfig)
{
	fs.writeFileSync(configs, JSON.stringify(newConfig, null, 2), 'utf8');
}

async function toggleConfig(path) 
{
	const config = readConfig();
	const keys = path.split('.');
	const lastKey = keys.pop();
	let current = config;

	for (const key of keys) 
	{
		if (current[key] === undefined) return console.log(`Path not found: ${path}`);
		current = current[key];
	}

	if (typeof current[lastKey] !== 'boolean') return console.log('This is not a valid config!');
	current[lastKey] = !current[lastKey];

	writeConfig(config);
}

function readLogic() 
{
	const dir = path.join(__dirname, '..', 'discord', 'logic');
	const modules = {};

	function loadFiles(directory) 
	{
		for (const file of fs.readdirSync(directory)) 
		{
			const filePath = path.join(directory, file);
			const stats = fs.statSync(filePath);

			if (stats.isDirectory()) loadFiles(filePath);
			else if (file.endsWith('.js')) 
			{
				const moduleName = path.basename(file, '.js');
				const moduleExports = require(filePath);

				if (typeof moduleExports === 'object' && moduleExports !== null) Object.assign(modules, moduleExports);
				else modules[moduleName] = moduleExports;
			}
		}
	}

	loadFiles(dir);
	return modules;
}

async function getEmoji(name) 
{
	const url = `https://discord.com/api/v10/applications/${appID}/emojis`;

	try 
	{
		const { default: fetch } = await import('node-fetch');
		const response = await fetch(url, {
			headers: {
				Authorization: `Bot ${token}`
			}
		});
		if (!response.ok) throw new Error(`Failed to fetch emojis: ${response.statusText}`);

		const data = await response.json();

		const emojis = data.items;

		const emoji = emojis.find(e => e.name === name);
		return emoji ? `<:${emoji.name}:${emoji.id}>` : null;
	} 
	catch (error) 
	{
		console.error('Error fetching emoji:', error);
		throw error;
	}
}

async function getPlayer(user)
{
	const player = await hypixel.getPlayer(user);

	return player;
}

async function getDiscord(user)
{
	const player = await getPlayer(user);
	const discord = await player.socialMedia.find(media => media.id === 'DISCORD');

	return discord.link;
}

async function getGuild(type, value) 
{
	let guild;
    
	if (type === 'player') guild = await hypixel.getGuild('player', value);
	else if (type === 'guild') guild = await hypixel.getGuild('name', value);

	return guild;
}

async function getSBLevelHighest(player)
{
	const sbMember = await hypixel.getSkyblockMember(player.uuid);
	let highestLevel = 0;
	for (const [profileName, profileData] of sbMember.entries()) 
	{
		if (highestLevel < profileData.level) highestLevel = profileData.level;
	}

	return highestLevel;
}

module.exports =
{
	readConfig,
	writeConfig,
	toggleConfig,
	readLogic,
	getEmoji,
	getPlayer,
	getDiscord,
	getGuild,
	getSBLevelHighest
};