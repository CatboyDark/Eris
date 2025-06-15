import auth from '../../../auth.json' with { type: 'json' };

export {
	getUser,
	getGuild
};

const guildCache = new Map();
const playerGuildCache = new Map();

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
	}, 60 * 60 * 1000);
}

function cacheTTL() {
	return Date.now() + 5 * 60 * 1000;
}

async function getUser(player) {
	const response = await fetch(`https://mowojang.matdoes.dev/${player}`);
	if (!response.ok) {
		switch (response.status) {
			case 404:
				throw new Error('Invalid Player');
			default:
				throw new Error(`Unknown Error | ${response.status} ${response.statusText}`);
		}
	}

	const data = await response.json();
	return {
		id: data.id,
		ign: data.name
	};
}

const getGuild = {
	name: async function (name) {
		const cache = guildCache.get(name);
		if (cache && Date.now() < cache.expiration) return cache.data;

		const response = await fetch(`https://api.hypixel.net/v2/guild?key=${auth.hypixelAPI}&name=${name}`);
		if (!response.ok) {
			switch (response.status) {
				case 403:
					throw new Error('Invalid API Key');
				case 429:
					throw new Error('Rate Limit');
				default:
					throw new Error(`Unknown Error | ${response.status} ${response.statusText}`);
			}
		}
		const data = await response.json();
		if (!data.guild) {
			throw new Error('Invalid Guild');
		}

		const expiration = cacheTTL();
		guildCache.set(data.guild.name, { data: data.guild, expiration });
		for (const member of data.guild.members) {
			playerGuildCache.set(member.uuid, { data: data.guild.name, expiration });
		}
		return data.guild;
	},

	player: async function (player) {
		const user = await getUser(player);
		const uuid = user.id;

		const cache = playerGuildCache.get(uuid);
		if (cache && Date.now() < cache.expiration) {
			const entry = guildCache.get(cache.data);
			if (entry && Date.now() < entry.expiration) return entry.data;
		}

		const response = await fetch(`https://api.hypixel.net/v2/guild?key=${auth.hypixelAPI}&player=${uuid}`);
		if (!response.ok) {
			switch (response.status) {
				case 403:
					throw new Error('Invalid API Key');
				case 429:
					throw new Error('Rate Limit');
				default:
					throw new Error(`Unknown Error | ${response.status} ${response.statusText}`);
			}
		}
		const data = await response.json();

		const expiration = cacheTTL();
		guildCache.set(data.guild.name, { data: data.guild, expiration });
		for (const member of data.guild.members) {
			playerGuildCache.set(member.uuid, { data: data.guild.name, expiration });
		}
		return data.guild;
	}
};
