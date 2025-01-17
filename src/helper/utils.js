import HAPI from './hapi.js';
import fs from 'fs';
import axios from 'axios';
import { Team } from 'discord.js';

function readConfig() {
	return JSON.parse(fs.readFileSync('./config.json', 'utf8'));
}

function writeConfig(newConfig) {
	fs.writeFileSync('./config.json', JSON.stringify(newConfig, null, 2), 'utf8');
}

function toggleConfig(path) {
	const config = readConfig();
	const keys = path.split('.');
	const lastKey = keys.pop();
	let current = config;

	for (const key of keys) {
		if (current[key] === undefined) {
			return console.log(`Path not found: ${path}`);
		}

		current = current[key];
	}

	if (typeof current[lastKey] !== 'boolean') {
		return console.log('Invalid config!');
	}

	current[lastKey] = !current[lastKey];
	writeConfig(config);
}

function scanDir(dir) { // Credits: Kathund
	let files = [];
	const items = fs.readdirSync(dir);
	items.forEach((item) => {
		const fullPath = `${dir}/${item}`;
		if (fs.statSync(fullPath).isDirectory()) {
			files = files.concat(scanDir(fullPath));
		} 
		else {
			files.push(fullPath);
		}
	});
	
	return files;
}

async function readLogic() { // Credits: Kathund
	const foundModules = scanDir('./src/discord/logic')
	.map((path) => { 
		return path.split('src/discord/logic/')[1]; 
	});
	const modules = {};
	for (const modulePath of foundModules) {
		const moduleData = await import(`../discord/logic/${modulePath}`);
		if (modules[modulePath.split('/')[0]] === undefined) modules[modulePath.split('/')[0]] = {};
		modules[modulePath.split('/')[0]][modulePath.split('/')[1].split('.js')[0]] = moduleData;
	};

	return modules;
}

async function getEmoji(name) {
	const url = `https://discord.com/api/v10/applications/${appID}/emojis`;

	try {
		const { default: fetch } = await import('node-fetch');
		const response = await fetch(url, {
			headers: {
				Authorization: `Bot ${token}`
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch emojis: ${response.statusText}`);
		}

		const data = await response.json();
		const emojis = data.items;
		const emoji = emojis.find((e) => e.name === name);
		return emoji ? `<:${emoji.name}:${emoji.id}>` : null;
	}
	catch (error) {
		console.error('Error fetching emoji:', error);
		throw error;
	}
}

async function getIGN(userData, uuid) { // Credits: Kathund
	try {
		const response = await axios.get(`https://mowojang.matdoes.dev/${uuid}`, 
		{
			headers: 
			{
				'User-Agent': `Discord: @${app.owner instanceof Team ? app.owner.owner?.username : app.owner.username}`
			}
		});
		return response.data.data.player.username;
	}
	catch (error) {
		console.error('Error fetching username for UUID:', error);
		return null;
	}
}

async function getPlayer(user) {
	const player = await HAPI.getPlayer(user);
	return player;
}

async function getDiscord(player) {
	const discord = player.socialMedia.find((media) => media.id === 'DISCORD');
	return discord ? discord.link.toLowerCase() : null;
}

async function getGuild(type, value) {
	let guild;

	if (type === 'player') {
		guild = await HAPI.getGuild('player', value);
	}
	else if (type === 'guild') {
		guild = await HAPI.getGuild('name', value);
	}

	return guild;
}

async function getSBLevelHighest(uuid) {
	let highestLevel = 0;
	const sbProfiles = await HAPI.getSkyblockProfiles(uuid).catch(() => null);
	if (null === sbProfiles) return highestLevel;

	sbProfiles.forEach((profile) => {
		const currentLevel = profile.me?.level || 0;
		if (currentLevel > highestLevel) highestLevel = currentLevel;
	});

	if (highestLevel > 50) highestLevel = 50;
	return highestLevel;
}

async function getSBLevel(player) {
	const data = await HAPI.getSkyblockProfiles(player).catch(() => null);
	const profile = data.find((profile) => profile.selected)?.me;

	if (profile === null || profile === undefined) {
		return console.log('Profiles not found!');
	}

	let level = profile.dungeons.experience.level;
	if (level > 50) {
		level = 50;
	}

	return level;
}

async function getCataHighest(uuid) {
	const sbProfiles = await HAPI.getSkyblockProfiles(uuid).catch(() => null);
	let highestLevel = 0;

	if (null === sbProfiles) return highestLevel;
	sbProfiles.forEach((profile) => {
		const currentLevel = profile.me?.dungeons.experience.level || 0;
		if (currentLevel > highestLevel) highestLevel = currentLevel;
	});

	if (highestLevel > 50) highestLevel = 50;
	return highestLevel;
}

async function getCata(player) {
	const data = await HAPI.getSkyblockProfiles(player).catch(() => null);
	const profile = data.find((profile) => profile.selected)?.me;

	if (profile === null || profile === undefined) {
		return console.log('Empty Profile!');
	}

	let level = profile.dungeons.experience.level;
	if (level > 50) {
		level = 50;
	}

	return level;
}

async function updateRoles(member, player, addLinkRole = false) {
	const config = readConfig();
	const guild = await getGuild('player', player.uuid);

	const addedRoles = [];
	const removedRoles = [];

	if (addLinkRole) {
		if (config.features.linkRoleToggle) {
			if (!member.roles.cache.has(config.features.linkRole)) {
				await member.roles.add(config.features.linkRole);
				addedRoles.push(config.features.linkRole);
			}
		}
	}

	if (config.features.guildRoleToggle) {
		if (guild && guild.name === config.guild) {
			if (!member.roles.cache.has(config.features.guildRole)) {
				await member.roles.add(config.features.guildRole);
				addedRoles.push(config.features.guildRole);
			}
		}
		else {
			if (member.roles.cache.has(config.features.guildRole)) {
				await member.roles.remove(config.features.guildRole);
				removedRoles.push(config.features.guildRole);
			}
		}
	}

	if (config.features.guildRankRolesToggle) {
		if (guild && guild.name === config.guild) {
			const gmember = guild.members.find((member) => member.uuid === player.uuid);
			const rank = gmember.rank;
			const rankIndex = guild.ranks.findIndex((r) => r.name === rank) + 1;

			const toggleKey = `guildRank${rankIndex}Toggle`;
			const roleKey = `guildRank${rankIndex}Role`;

			if (config.features[toggleKey]) {
				const roleID = config.guildRankRoles[roleKey];
				const role = member.guild.roles.cache.get(roleID);

				await member.roles.add(role);
				addedRoles.push(roleID);
			}

			for (const [key, id] of Object.entries(config.guildRankRoles)) {
				if (key !== roleKey && id && member.roles.cache.has(id)) {
					await member.roles.remove(id);
					removedRoles.push(id);
				}
			}
		}
	}

	if (config.features.levelRolesToggle) {
		const level = await getSBLevelHighest(player);
		const levelKey = Math.floor(level / 40) * 40;
		const assignedRole = config.levelRoles[levelKey];

		if (assignedRole) {
			if (!member.roles.cache.has(assignedRole)) {
				await member.roles.add(assignedRole);
				addedRoles.push(assignedRole);
			}
		}

		for (const roleID of Object.values(config.levelRoles)) {
			if (roleID !== assignedRole && member.roles.cache.has(roleID)) {
				await member.roles.remove(roleID);
				removedRoles.push(roleID);
			}
		}
	}

	if (config.features.cataRolesToggle) {
		const cataHighest = await getCataHighest(player);
		let highestCataRole = null;

		for (const [level, roleID] of Object.entries(config.cataRoles)) {
			if (parseInt(level) <= cataHighest) {
				highestCataRole = roleID;
			}
		}

		if (highestCataRole) {
			if (!member.roles.cache.has(highestCataRole)) {
				await member.roles.add(highestCataRole);
				addedRoles.push(highestCataRole);
			}
		}

		// eslint-disable-next-line no-unused-vars
		for (const [level, roleID] of Object.entries(config.cataRoles)) {
			if (roleID !== highestCataRole && member.roles.cache.has(roleID)) {
				await member.roles.remove(roleID);
				removedRoles.push(roleID);
			}
		}
	}

	return { addedRoles, removedRoles };
}

export 
{
	readConfig,
	writeConfig,
	toggleConfig,
	readLogic,
	getEmoji,
	getPlayer,
	getIGN,
	getDiscord,
	getGuild,
	getSBLevelHighest,
	getSBLevel,
	getCataHighest,
	getCata,
	updateRoles
};
