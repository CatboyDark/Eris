import auth from '../../../auth.json' with { type: 'json' };
import { HypixelInvalidAPIKey, HypixelInvalidGuild, HypixelRateLimit, InvalidIGN, UnknownError } from '../utils.js';

export {
	getUser,
	getPlayer,
	getDiscord,
	getGuild,
	getSkyblockLevel
};

/*
	Non-cached API calls:
	- getDiscord
*/

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

async function getUser(ign) {
	const response = await fetch(`https://mowojang.matdoes.dev/${ign}`);
	if (!response.ok) {
		switch (response.status) {
			case 404:
				throw new InvalidIGN();
			default:
				throw new UnknownError(response);
		}
	}
	const data = await response.json();

	return {
		id: data.id,
		ign: data.name
	};
}

async function getPlayer(ign) {
	const user = await getUser(ign);
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

	return data.player;
}

async function getDiscord(ign) {
	const player = await getPlayer(ign);
	return player.socialMedia.links?.DISCORD.toLowerCase();
}

const getGuild = {
	name: async function (name) {
		const cache = guildCache.get(name);
		if (cache && Date.now() < cache.expiration) return cache.data;

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

		data.guild.level = toGuildLevel(data.guild.exp);

		const expiration = cacheTTL();
		guildCache.set(data.guild.name, { data: data.guild, expiration });
		for (const member of data.guild.members) {
			playerGuildCache.set(member.uuid, { data: data.guild.name, expiration });
		}

		return data.guild;
	},

	player: async function (ign) {
		const user = await getUser(ign);
		const uuid = user.id;

		const cache = playerGuildCache.get(uuid);
		if (cache && Date.now() < cache.expiration) {
			if (cache.data === null) return null;
			
			const entry = guildCache.get(cache.data);
			if (entry && Date.now() < entry.expiration) return entry.data;
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
			data.guild.level = toGuildLevel(data.guild.exp);
			guildCache.set(data.guild.name, { data: data.guild, expiration });

			for (const member of data.guild.members) {
				playerGuildCache.set(member.uuid, { data: data.guild.name, expiration });
			}

			return data.guild;
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

async function getSkyblock(ign, { withUUID = false } = {}) {
	const user = await getUser(ign);
	const uuid = user.id;

	const cache = skyblockCache.get(uuid);
	if (cache && Date.now() < cache.expiration) return withUUID ? { uuid, data: cache.data } : cache.data;

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

	const expiration = cacheTTL();
	skyblockCache.set(uuid, { data: data.profiles, expiration });

	return withUUID ? { uuid, data: data.profiles } : data.profiles;
}

const getSkyblockLevel = async function(ign) {
	const { uuid, data } = await getSkyblock(ign, { withUUID: true });

	let xp = 0;
	for (const profile of data) {
		const experience = profile.members[uuid].leveling?.experience ?? 0;
		if (experience > xp) xp = experience;
	}

	return (xp / 100).toFixed(2);
};

getSkyblockLevel.current = async function (ign) {
	const { uuid, data } = await getSkyblock(ign, { withUUID: true });
	for (const profile of data) {
		if (profile.selected) return (profile.members[uuid].leveling.experience / 100).toFixed(2);
	}
};
