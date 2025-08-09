import fs from 'fs';
import auth from '../../../auth.json' with { type: 'json' };
import { getUser, HypixelInvalidAPIKey, HypixelInvalidGuild, HypixelRateLimit, UnknownError } from '../utils.js';
import { ProfileNetworthCalculator } from 'skyhelper-networth';

export {
	getPlayer,
	getGuild,
	getSkyblock
};

const guildCache = new Map();
const playerGuildCache = new Map();
const skyblockCache = new Map();

if (!globalThis.__cache) {
	globalThis.__cache = true;

	setInterval(() => {
		const now = Date.now();

		for (const [key, value] of guildCache.entries()) {
			if (now > value.expiration) guildCache.delete(key);
		}

		for (const [key, value] of playerGuildCache.entries()) {
			if (now > value.expiration) playerGuildCache.delete(key);
		}

		for (const [key, value] of skyblockCache.entries()) {
			if (now > value.expiration) skyblockCache.delete(key);
		}
	},
	60 * 60 * 1000);
}

function cacheTTL() {
	return Date.now() + 5 * 60 * 1000;
}

async function getPlayer(player) {
	const user = await getUser(player);
	const uuid = user.id;

	const response = await fetch(`https://api.hypixel.net/v2/player?key=${auth.hypixelAPIKey}&uuid=${uuid}`);
	if (!response.ok) {
		switch (response.status) {
			case 403:
				throw new HypixelInvalidAPIKey();
			case 429:
				throw new HypixelRateLimit();
			default:
				throw new UnknownError(response);
		}
	}
	const data = await response.json();

	return {
		ign: data.player?.displayname ?? null,
		id: data.player?.uuid ?? null,
		discord: data.player?.socialMedia?.links?.DISCORD?.toLowerCase() ?? null
	};
}

const getGuild = {
	async name(name) {
		const cache = guildCache.get(name);
		if (cache && Date.now() < cache.expiration) {
			const { expiration, ...guildData } = cache;
  			return guildData;
		}

		const response = await fetch(`https://api.hypixel.net/v2/guild?key=${auth.hypixelAPIKey}&name=${name}`);
		if (!response.ok) {
			switch (response.status) {
				case 403:
					throw new HypixelInvalidAPIKey();
				case 429:
					throw new HypixelRateLimit();
				default:
					throw new UnknownError(response);
			}
		}
		const data = await response.json();
		if (!data.guild) {
			throw new HypixelInvalidGuild();
		}

		const expiration = cacheTTL();
		const guildData = {
			name: data.guild.name,
			members: data.guild.members.map(member => ({ ...member, weeklyGXP: Object.values(member.expHistory).reduce((sum, val) => sum + val, 0) })),
			ranks: data.guild.ranks,
			level: toGuildLevel(data.guild.exp),
			weeklyGXP: data.guild.members.reduce((sum, member) => sum + Object.values(member.expHistory).reduce((s, v) => s + v, 0), 0)
		};

		guildCache.set(guildData.name, { ...guildData, expiration });
		for (const member of data.guild.members) {
			playerGuildCache.set(member.uuid, { data: data.guild.name, expiration });
		}

		return guildData;
	},

	async player(uuid) {
		const cache = playerGuildCache.get(uuid);
		if (cache && Date.now() < cache.expiration) {
			if (cache.data === null) return null;

			const entry = guildCache.get(cache.data);
			if (entry && Date.now() < entry.expiration) {
				const { expiration, ...guildData } = entry;
  				return guildData;
			}
		}

		const response = await fetch(`https://api.hypixel.net/v2/guild?key=${auth.hypixelAPIKey}&player=${uuid}`);
		if (!response.ok) {
			switch (response.status) {
				case 403:
					throw new HypixelInvalidAPIKey();
				case 429:
					throw new HypixelRateLimit();
				default:
					throw new UnknownError(response);
			}
		}
		const data = await response.json();

		const expiration = cacheTTL();

		if (data.guild) {
			const guildData = {
				name: data.guild.name,
				members: data.guild.members.map(member => ({ ...member, weeklyGXP: Object.values(member.expHistory).reduce((sum, val) => sum + val, 0) })),
				ranks: data.guild.ranks,
				level: toGuildLevel(data.guild.exp),
				weeklyGXP: data.guild.members.reduce((sum, member) => sum + Object.values(member.expHistory).reduce((s, v) => s + v, 0), 0)
			};

			guildCache.set(guildData.name, { ...guildData, expiration });
			for (const member of data.guild.members) {
				playerGuildCache.set(member.uuid, { data: data.guild.name, expiration });
			}

			return guildData;
		}
		else {
			playerGuildCache.set(uuid, { data: null, expiration });
			return null;
		}
	}
};

function toGuildLevel(xp) {
	const thresholds = [
		100_000,
		150_000,
		250_000,
		500_000,
		750_000,
		1_000_000,
		1_250_000,
		1_500_000,
		2_000_000,
		2_500_000,
		2_500_000,
		2_500_000,
		2_500_000,
		2_500_000
	];

	for (let i = 0; i < thresholds.length; i++) {
		if (xp < thresholds[i]) {
			return i + xp / thresholds[i];
		}
		xp -= thresholds[i];
	}

	return thresholds.length + xp / 3_000_000;
}

async function getSkyblock(uuid, profile, { networth = false } = {}) {
	const cache = skyblockCache.get(uuid);
	if (cache && Date.now() < cache.expiration) {
		const { raw, expiration, profiles, selectedProfile } = cache;

		const key = Object.keys(profiles).find(k => k.toLowerCase() === profile?.toLowerCase()) ?? selectedProfile ?? Object.entries(profiles).sort(([, a], [, b]) => b.level - a.level)[0]?.[0] ?? null;

		if (networth && !profiles[key].networth) {
			const profile = raw.profiles.find(p => p.cute_name.toLowerCase() === key.toLowerCase());
			const museum = await getMuseum(profile.profile_id);
			const networthManager = new ProfileNetworthCalculator(profile.members[uuid], museum.members[uuid], profile.banking?.balance ?? 0);
			const nw = await networthManager.getNetworth();

			profiles[key].networth = nw.networth;

			skyblockCache.set(uuid, { raw, profiles, selectedProfile, expiration });
		}

		return profiles[key];
	}

	const response = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?key=${auth.hypixelAPIKey}&uuid=${uuid}`);
	if (!response.ok) {
		switch (response.status) {
			case 403:
				throw new HypixelInvalidAPIKey();
			case 429:
				throw new HypixelRateLimit();
			default:
				throw new UnknownError(response);
		}
	}
	const data = await response.json();

	const profiles = {};
	let selectedProfile = null;

	for (const profile of data.profiles) {
		const name = profile.cute_name;
		if (profile.selected) selectedProfile = name;

		profiles[name] = {
			id: profile.profile_id,
			bank: profile.banking?.balance ?? 0,
			purse: profile.members[uuid].currencies?.coin_purse ?? 0,
			level: getLevel(profile.members[uuid]),
			skills: getSkills(profile.members[uuid]),
			cata: getCata(profile.members[uuid]),
			slayers: getSlayers(profile.members[uuid]),
			networth: null
		};
	}

	const expiration = cacheTTL();
	skyblockCache.set(uuid, { raw: data, profiles, selectedProfile, expiration });

	const key = Object.keys(profiles).find(k => k.toLowerCase() === profile?.toLowerCase()) ?? selectedProfile ?? Object.entries(profiles).sort(([, a], [, b]) => b.level - a.level)[0]?.[0] ?? null;

	if (networth) {
		const profile = data.profiles.find(p => p.cute_name.toLowerCase() === key.toLowerCase());
		const museum = await getMuseum(profile.profile_id);
		const networthManager = new ProfileNetworthCalculator(profile.members[uuid], museum.members[uuid], profile.banking?.balance ?? 0);
		const nw = await networthManager.getNetworth();

		profiles[key].networth = nw.networth;
	}

	return profiles[key];
}

async function getMuseum(profile) {
	const response = await fetch(`https://api.hypixel.net/v2/skyblock/museum?key=${auth.hypixelAPIKey}&profile=${profile}`);

	const data = await response.json();
	return data;
}

Math.floor1 = function (i) {
	return Math.floor(i * 10) / 10;
};

Math.floor2 = function (num) {
	return Math.floor(num * 100) / 100;
};

function getLevel(player) {
	return (player.leveling?.experience / 100) ?? 0;
}

const skillXP = JSON.parse(fs.readFileSync('./assets/skillXP.json', 'utf8'));

const realSkills = [
	'combat',
	'farming',
	'fishing',
	'mining',
	'foraging',
	'enchanting',
	'alchemy',
	'taming',
	'carpentry',
	'hunting'
];

const allSkills = [
	...realSkills,
	'rune',
	'social'
];

function toSkillLevel(skill, xp) {
	const cap = skillXP.caps[skill];

	let xpTable;
	if (skill === 'rune') xpTable = skillXP.rune_xp;
	else if (skill === 'social') xpTable = skillXP.social_xp;
	else xpTable = skillXP.xp;

	let totalXP = 0;

	for (let i = 1; i <= cap; i++) {
		const required = xpTable[i];
		if (xp < totalXP + required) {
			const remainder = xp - totalXP;
			return i - 1 + (remainder / required);
		}
		totalXP += required;
	}

	return cap;
}

// runecrafting if user === non, cap = 3

function getSkills(player) {
	const exp = player.player_data?.experience;

	const skills = {};
	let total = 0;
	let count = 0;

	if (!exp) {
		for (const key of allSkills) {
			skills[key] = 0;
		}
	}
	else {
		for (const key of allSkills) {
			const xp = exp[`SKILL_${key.toUpperCase()}`] ?? 0;
			const level = toSkillLevel(key === 'runecrafting' ? 'rune' : key, xp);

			skills[key] = level;

			if (realSkills.includes(key)) {
				total += level;
				count++;
			}
		}
	}

	const average = count > 0 ? total / count : 0;

	return { average, ...skills};
}

const cataXP = JSON.parse(fs.readFileSync('./assets/cataXP.json', 'utf8'));

function toCataLevel(xp) {
	let requiredXP = 0;
	for (let i = 1; i <= 50; i++) {
		const levelXp = cataXP[i];
		if (xp < requiredXP + levelXp) {
			return i - 1 + (xp - requiredXP) / levelXp;
		}
		requiredXP += levelXp;
	}
	return 50 + (xp - requiredXP) / 200000000;
}

function toDungeonTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const allClasses = ['healer', 'mage', 'berserk', 'archer', 'tank'];

function getCata(player) {
	const dungeons = player.dungeons;

	const totalRuns =
		[0, 1, 2, 3, 4, 5, 6, 7].reduce((sum, key) => sum + (dungeons?.dungeon_types?.catacombs?.tier_completions?.[key] ?? 0), 0) +
		[1, 2, 3, 4, 5, 6, 7].reduce((sum, key) => sum + (dungeons?.dungeon_types?.master_catacombs?.tier_completions?.[key] ?? 0), 0);

	const classes = {};
	for (const name of allClasses) {
		const xp = dungeons?.player_classes?.[name]?.experience ?? 0;
		classes[name] = toCataLevel(xp);
	}

	let classAvg = 0;
	const classLevels = Object.values(classes);
	const cappedLevels = classLevels.every(level => level >= 50) ? classLevels : classLevels.map(level => Math.min(level, 50));
	if (cappedLevels.length > 0) classAvg = cappedLevels.reduce((sum, lvl) => sum + lvl, 0) / cappedLevels.length;

	const floors = {};

	const keys = ['f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'];

	for (const floor of keys) {
		const type = dungeons?.dungeon_types?.[floor[0] === 'f' ? 'catacombs' : 'master_catacombs'];
		const tier = floor.slice(1);

		let score = null;
		let time = 0;
		let runs = 0;
		let collection = 0;

		if (type?.fastest_time_s_plus?.[tier]) {
			score = 'S+';
			time = type.fastest_time_s_plus[tier];
		}
		else if (type?.fastest_time_s?.[tier]) {
			score = 'S';
			time = type.fastest_time_s[tier];
		}
		else if (type?.fastest_time?.[tier]) {
			score = 'No Score';
			time = type.fastest_time[tier];
		}

		runs = type?.tier_completions?.[tier] ?? 0;
		const catacombsRuns = dungeons?.dungeon_types?.catacombs?.tier_completions?.[tier] ?? 0;
		const masterRuns = dungeons?.dungeon_types?.master_catacombs?.tier_completions?.[tier] ?? 0;

		collection = catacombsRuns + masterRuns * 2;

		floors[floor] = { score, time: toDungeonTime(time), runs, collection };
	}

	return {
		level: toCataLevel(dungeons?.dungeon_types?.catacombs?.experience ?? 0),
		classes,
		classAvg,
		floors,
		secrets: dungeons?.secrets ?? 0,
		spr: totalRuns > 0 ? (dungeons?.secrets ?? 0) / totalRuns : 0
	};
}

const slayerXP = JSON.parse(fs.readFileSync('./assets/slayerXP.json', 'utf8'));
const allSlayers = {
	zombie: 5,
	spider: 5,
	wolf: 4,
	ender: 4,
	blaze: 4,
	vampire: 5
};

function toSlayerLevel(slayer, xp) {
	const xpTable = slayerXP[slayer];
	const cap = Math.max(...Object.keys(xpTable).map(Number));

	for (let i = 1; i <= cap; i++) {
		if (xp < xpTable[i]) return i - 1;
	}

	return cap;
}

function getSlayers(player) {
	const slayers = player.slayer?.slayer_bosses ?? {};
	const slayerData = {};

	for (const [slayer, maxTier] of Object.entries(allSlayers)) {
		const key = slayer === 'ender' ? 'enderman' : slayer;
		const data = slayers[key] ?? {};

		const xp = data.xp ?? 0;
		const level = toSlayerLevel(slayer, xp);

		const stats = {
			xp,
			level
		};

		for (let tier = 0; tier < maxTier; tier++) {
			const kills = data[`boss_kills_tier_${tier}`] ?? 0;
			stats[`t${tier + 1}`] = kills;
		}

		slayerData[slayer] = stats;
	}

	return slayerData;
}
