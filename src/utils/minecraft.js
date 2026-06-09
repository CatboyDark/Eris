import { ProfileNetworthCalculator } from 'skyhelper-networth'
import { HypixelInvalidAPIKeyError, HypixelInvalidGuildError, HypixelMissingAPIKeyError, HypixelMissingSkyblockDataError, HypixelRateLimitError, MinecraftInvalidPlayerError, UnknownNetworkError, HypixelInvalidArgsGetGuildError, MinecraftInvalidArgsGetPlayerError, HypixelInvalidArgsGetSkyblockError, read } from '#utils'

const auth = read('auth.json')

class Minecraft {
	constructor() {
		setInterval(() => this.#clearCache(), 60 * 60 * 1000)
	}

	#idCache = new Map()
	#ignCache = new Map()
	#ttl = 60 * 60 * 1000

	#clearCache() {
		const now = Date.now()

		for (const [key, value] of this.#idCache.entries()) {
			if (now >= value.expiration) {
				this.#idCache.delete(key)
			}
		}

		for (const [key, value] of this.#ignCache.entries()) {
			if (now >= value.expiration) {
				this.#ignCache.delete(key)
			}
		}
	}

	async #request(endpoint, { ign, id }) {
		console.debug(`Requesting Minecraft API: ${endpoint}`)
		const response = await fetch(`https://api.minecraftservices.com/${endpoint}`, {
			headers: {
				'Accept': 'application/json'
			}
		})

		if (!response.ok) {
			switch (response.status) {
				case 400: throw new MinecraftInvalidPlayerError(ign ? { ign } : { id })
				case 404: throw new MinecraftInvalidPlayerError(ign ? { ign } : { id })
				default: throw new UnknownNetworkError(response)
			}
		}

		return await response.json()
	}

	async getPlayer({ id, ign } = {}) {
		const now = Date.now()

		let data
		if (id) {
			const cache = this.#idCache.get(id)
			if (cache && now < cache.expiration) {
				console.debug('Using ID cache for Minecraft player')
				return cache.data
			}

			data = await this.#request(`minecraft/profile/lookup/${id}`, { id })
		}
		else if (ign) {
			const cache = this.#ignCache.get(ign.toLowerCase())
			if (cache && now < cache.expiration) {
				console.debug('Using IGN cache for Minecraft player')
				return cache.data
			}

			data = await this.#request(`minecraft/profile/lookup/name/${ign}`, { ign })
		}
		else {
			throw new MinecraftInvalidArgsGetPlayerError()
		}

		const entry = {
			data: {
				id: data.id,
				ign: data.name
			},
			expiration: Date.now() + this.#ttl
		}

		this.#idCache.set(entry.data.id, entry)
		this.#ignCache.set(entry.data.ign.toLowerCase(), entry)

		return entry.data
	}
}

const minecraft = new Minecraft()

class Hypixel {
	constructor() {
		if (!auth.hypixelAPIKey) {
			throw new HypixelMissingAPIKeyError()
		}
		this.key = auth.hypixelAPIKey

		setInterval(() => this.#clearCache(), 24 * 60 * 60 * 1000)
	}

	#guildCache = new Map()
	#guildIDCache = new Map()
	#playerToGuildCache = new Map()
	#skyblockCache = new Map()
	#ttl = 5 * 60 * 1000

	#clearCache() {
		const now = Date.now()

		for (const [key, value] of this.#guildCache.entries()) {
			if (now >= value.expiration) {
				this.#guildCache.delete(key)
			}
		}

		for (const [key, value] of this.#guildIDCache.entries()) {
			if (now >= value.expiration) {
				this.#guildIDCache.delete(key)
			}
		}

		for (const [key, value] of this.#playerToGuildCache.entries()) {
			if (now >= value.expiration) {
				this.#playerToGuildCache.delete(key)
			}
		}

		for (const [key, value] of this.#skyblockCache.entries()) {
			if (now >= value.expiration) {
				this.#skyblockCache.delete(key)
			}
		}
	}

	async #request(endpoint, { playerID } = {}) {
		const response = await fetch(`https://api.hypixel.net/v2/${endpoint}`, {
			headers: {
				'API-Key': this.key,
				'Accept': 'application/json'
			}
		})

		if (!response.ok) {
			switch (response.status) {
				case 403: throw new HypixelInvalidAPIKeyError()
				case 422: throw new MinecraftInvalidPlayerError({ id: playerID })
				case 429: throw new HypixelRateLimitError()
				default: throw new UnknownNetworkError(response)
			}
		}

		return await response.json()
	}

	async getPlayer({ id, ign } = {}) {
		let uuid
		if (ign) {
			const x = await minecraft.getPlayer({ id, ign })
			uuid = x.id
		}
		else if (id) {
			uuid = id
		}
		const data = await this.#request(`player?uuid=${uuid}`)

		// TODO
		// I could let this populate idCache and ignCache from minecraft(), but the id arg is unlikely to be used on the frontend
		// The ign arg would be used 99% of the time, and it already runs through minecraft.getPlayer()

		return {
			ign: data.player.displayname,
			id: data.player.uuid,
			discord: data.player.socialMedia?.links?.DISCORD?.toLowerCase() ?? null
		}
	}

	async getGuild({ guildID, guildName, playerID, playerName } = {}) {
		const now = Date.now()

		let data
		if (guildID) {
			const cache = this.#guildIDCache.get(guildID)
			if (cache && now < cache.expiration) {
				console.debug('Using guild ID cache for Hypixel guild')
				return cache.data
			}

			console.debug('Requesting Hypixel guild by ID')
			data = await this.#request(`guild?id=${guildID}`)
		}
		else if (guildName) {
			const cache = this.#guildCache.get(guildName.toLowerCase())
			if (cache && now < cache.expiration) {
				console.debug('Using guild cache for Hypixel guild')
				return cache.data
			}

			console.debug('Requesting Hypixel guild by name')
			data = await this.#request(`guild?name=${guildName}`)
		}
		else if (playerID) {
			const cache = this.#playerToGuildCache.get(playerID)
			if (cache && now < cache.expiration) {
				console.debug('Using player to guild cache for Hypixel guild')
				return cache.data
			}

			console.debug('Requesting Hypixel guild by player ID')
			data = await this.#request(`guild?player=${playerID}`, { playerID })
		}
		else if (playerName) {
			const player = await minecraft.getPlayer({ ign: playerName })
			playerID = player.id
			const cache = this.#playerToGuildCache.get(playerID)
			if (cache && now < cache.expiration) {
				console.debug('Using player to guild cache for Hypixel guild')
				return cache.data
			}

			console.debug('Requesting Hypixel guild by player ID from player name')
			data = await this.#request(`guild?player=${player.id}`)
		}
		else {
			throw new HypixelInvalidArgsGetGuildError()
		}

		if (data.guild) {
			const entry = {
				data: {
					name: data.guild.name,
					id: data.guild._id,
					members: data.guild.members.map(member => ({ ...member, weeklyGXP: Object.values(member.expHistory).reduce((sum, val) => sum + val, 0) })),
					ranks: data.guild.ranks,
					level: toGuildLevel(data.guild.exp),
					weeklyGXP: data.guild.members.reduce((sum, member) => sum + Object.values(member.expHistory).reduce((s, v) => s + v, 0), 0)
				},
				expiration: now + this.#ttl
			}

			this.#guildCache.set(entry.data.name.toLowerCase(), entry)
			this.#guildIDCache.set(entry.data.id, entry)
			for (const member of data.guild.members) {
				this.#playerToGuildCache.set(member.uuid, entry)
			}

			return entry.data
		}
		else if (playerID) {
			this.#playerToGuildCache.set(playerID, { data: null, expiration: now + this.#ttl })
			return null
		}
		else {
			throw new HypixelInvalidGuildError(guildName ? { guildName } : { guildID })
		}
	}

	async getSkyblock({ id, ign } = {}) {
		const now = Date.now()

		if (id) {
			const cache = this.#skyblockCache.get(id)
			if (cache && now < cache.expiration) {
				console.debug('Using skyblock cache for Hypixel Skyblock profile')
				return cache.data
			}
		}
		else if (ign) {
			const player = await minecraft.getPlayer({ ign })
			const cache = this.#skyblockCache.get(player.id)
			if (cache && now < cache.expiration) {
				console.debug('Using skyblock cache for Hypixel Skyblock profile')
				return cache.data
			}

			id = player.id
		}
		else {
			throw new HypixelInvalidArgsGetSkyblockError()
		}

		const data = await this.#request(`skyblock/profiles?uuid=${id}`)

		const profiles = {}
		let selectedProfile = null

		if (!data.profiles) throw new HypixelMissingSkyblockDataError(ign ? { ign } : { id })

		for (const profile of data.profiles) {
			const name = profile.cute_name
			if (profile.selected) selectedProfile = name

			profiles[name] = {
				bank: profile.banking?.balance ?? 0,
				purse: profile.members[id].currencies?.coin_purse ?? 0,
				level: getLevel(profile.members[id]),
				skills: getSkills(profile.members[id]),
				cata: getCata(profile.members[id]),
				slayers: getSlayers(profile.members[id]),
				networth: null
			}
		}

		const entry = {
			data: {
				profiles,
				selectedProfile,
				raw: data
			},
			expiration: now + this.#ttl
		}

		this.#skyblockCache.set(id, entry)
		return entry.data
	}

	// TODO
	// Networth could have its own ttl timer instead of resetting with skyblock cache.

	async getNetworth({ id, ign, profile } = {}) {
		if (!id) {
			const data = await minecraft.getPlayer({ ign })
			id = data.id
		}

		const skyblockData = await this.getSkyblock({ id })
		const { profiles, selectedProfile, raw } = skyblockData

		const targetProfile = Object.keys(profiles).find(p => p.toLowerCase() === profile?.toLowerCase())
		?? Object.keys(profiles).find(p => p.toLowerCase() === selectedProfile.toLowerCase())
		?? Object.keys(profiles)[0]

		let data
		if (profiles[targetProfile].networth === null) {
			const rawProfile = raw.profiles.find(p => p.cute_name.toLowerCase() === targetProfile.toLowerCase())
			const museum = await this.getMuseum(rawProfile.profile_id)
			const calculator = new ProfileNetworthCalculator(rawProfile.members[id], museum.members[id], rawProfile.banking?.balance ?? 0)
			data = await calculator.getNetworth()
		}

		return profiles[targetProfile].networth = data.networth
	}

	async getMuseum(profileID) {
		return await this.#request(`skyblock/museum?profile=${profileID}`)
	}
}

const hypixel = new Hypixel()

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
	]

	for (let i = 0; i < thresholds.length; i++) {
		if (xp < thresholds[i]) {
			return i + xp / thresholds[i]
		}
		xp -= thresholds[i]
	}

	return thresholds.length + xp / 3_000_000
}

function getLevel(player) {
	return ((player.leveling?.experience ?? 0) / 100)
}

const skillXP = read('./assets/skillXP.json')

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
]

const allSkills = [
	...realSkills,
	'rune',
	'social'
]

function toSkillLevel(skill, xp) {
	const cap = skillXP.caps[skill]

	let xpTable
	if (skill === 'rune') xpTable = skillXP.rune_xp
	else if (skill === 'social') xpTable = skillXP.social_xp
	else xpTable = skillXP.xp

	let totalXP = 0

	for (let i = 1; i <= cap; i++) {
		const required = xpTable[i]
		if (xp < totalXP + required) {
			const remainder = xp - totalXP
			return i - 1 + (remainder / required)
		}
		totalXP += required
	}

	return cap
}

// runecrafting if user === non, cap = 3

function getSkills(player) {
	const exp = player.player_data?.experience

	const skills = {}
	let total = 0
	let count = 0

	if (!exp) {
		for (const key of allSkills) {
			skills[key] = 0
		}
	}
	else {
		for (const key of allSkills) {
			const xp = exp[`SKILL_${key.toUpperCase()}`] ?? 0
			const level = toSkillLevel(key === 'runecrafting' ? 'rune' : key, xp)

			skills[key] = level

			if (realSkills.includes(key)) {
				total += level
				count++
			}
		}
	}

	const average = count > 0 ? total / count : 0

	return { average, ...skills }
}

const cataXP = read('./assets/cataXP.json')

function toCataLevel(xp) {
	let requiredXP = 0
	for (let i = 1; i <= 50; i++) {
		const levelXp = cataXP[i]
		if (xp < requiredXP + levelXp) {
			return i - 1 + (xp - requiredXP) / levelXp
		}
		requiredXP += levelXp
	}
	return 50 + (xp - requiredXP) / 200000000
}

function toDungeonTime(ms) {
	const totalSeconds = Math.floor(ms / 1000)
	const minutes = Math.floor(totalSeconds / 60)
	const seconds = totalSeconds % 60
	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const allClasses = ['healer', 'mage', 'berserk', 'archer', 'tank']

function getCata(player) {
	const dungeons = player.dungeons

	const totalRuns =
		[0, 1, 2, 3, 4, 5, 6, 7].reduce((sum, key) => sum + (dungeons?.dungeon_types?.catacombs?.tier_completions?.[key] ?? 0), 0) +
		[1, 2, 3, 4, 5, 6, 7].reduce((sum, key) => sum + (dungeons?.dungeon_types?.master_catacombs?.tier_completions?.[key] ?? 0), 0)

	const classes = {}
	for (const name of allClasses) {
		const xp = dungeons?.player_classes?.[name]?.experience ?? 0
		classes[name] = toCataLevel(xp)
	}

	let classAvg = 0
	const classLevels = Object.values(classes)
	const cappedLevels = classLevels.every(level => level >= 50) ? classLevels : classLevels.map(level => Math.min(level, 50))
	if (cappedLevels.length > 0) classAvg = cappedLevels.reduce((sum, lvl) => sum + lvl, 0) / cappedLevels.length

	const floors = {}

	const keys = ['f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7']

	for (const floor of keys) {
		const type = dungeons?.dungeon_types?.[floor[0] === 'f' ? 'catacombs' : 'master_catacombs']
		const tier = floor.slice(1)

		let score = null
		let time = 0

		if (type?.fastest_time_s_plus?.[tier]) {
			score = 'S+'
			time = type.fastest_time_s_plus[tier]
		}
		else if (type?.fastest_time_s?.[tier]) {
			score = 'S'
			time = type.fastest_time_s[tier]
		}
		else if (type?.fastest_time?.[tier]) {
			score = 'No Score'
			time = type.fastest_time[tier]
		}

		const runs = type?.tier_completions?.[tier] ?? 0
		const catacombsRuns = dungeons?.dungeon_types?.catacombs?.tier_completions?.[tier] ?? 0
		const masterRuns = dungeons?.dungeon_types?.master_catacombs?.tier_completions?.[tier] ?? 0

		const collection = catacombsRuns + masterRuns * 2

		floors[floor] = { score, time: toDungeonTime(time), runs, collection }
	}

	return {
		level: toCataLevel(dungeons?.dungeon_types?.catacombs?.experience ?? 0),
		classes,
		classAvg,
		floors,
		secrets: dungeons?.secrets ?? 0,
		spr: totalRuns > 0 ? (dungeons?.secrets ?? 0) / totalRuns : 0
	}
}

const slayerXP = read('./assets/slayerXP.json')
const allSlayers = {
	zombie: 5,
	spider: 5,
	wolf: 4,
	ender: 4,
	blaze: 4,
	vampire: 5
}

function toSlayerLevel(slayer, xp) {
	const xpTable = slayerXP[slayer]
	const cap = Math.max(...Object.keys(xpTable).map(Number))

	for (let i = 1; i <= cap; i++) {
		if (xp < xpTable[i]) return i - 1
	}

	return cap
}

function getSlayers(player) {
	const slayers = player.slayer?.slayer_bosses ?? {}
	const slayerData = {}

	for (const [slayer, maxTier] of Object.entries(allSlayers)) {
		const key = slayer === 'ender' ? 'enderman' : slayer
		const data = slayers[key] ?? {}

		const xp = data.xp ?? 0
		const level = toSlayerLevel(slayer, xp)

		const stats = {
			xp,
			level
		}

		for (let tier = 0; tier < maxTier; tier++) {
			const kills = data[`boss_kills_tier_${tier}`] ?? 0
			stats[`t${tier + 1}`] = kills
		}

		slayerData[slayer] = stats
	}

	return slayerData
}


export {
	minecraft,
	hypixel
}