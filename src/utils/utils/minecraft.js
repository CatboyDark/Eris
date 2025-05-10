import Canvas from 'canvas';
import { AttachmentBuilder } from 'discord.js';
import fs from 'fs';
import auth from '../../../auth.json' with { type: 'json' };
import hypixel from '../api/hypixel.js';
import { readConfig } from '../utils.js';

export {
	createImage,
	getCata,
	getDiscord,
	getGuild,
	getNw,
	getPlayer,
	getSBLevel,
	getSlayers,
	getUser,
	messageQ,
	nFormat,
	send
};

async function getUser(user) {
	try {
		const response = await fetch(`https://mowojang.matdoes.dev/${user}`);
		if (!response) {
			return null;
		}

		const data = await response.json();
		return {
			id: data.id,
			ign: data.name
		};
	}
	catch (e) {
		if (e.response?.data === 'Not found') return null;
		console.log(e);
	}
}

async function getPlayer(user) {
	const player = await hypixel.getPlayer(user);
	return player;
}

async function getDiscord(player) {
	const discord = player.socialMedia.find((media) => media.id === 'DISCORD');
	return discord ? discord.link.toLowerCase() : null;
}

const getGuild = {
	name: async function (value) {
		return await hypixel.getGuild('name', value);
	},

	player: async function (value) {
		return await hypixel.getGuild('player', value);
	}
};

const getSBLevel = {
	highest: async function (player) {
		let level = 0;

		const profiles = await hypixel.getSkyblockMember(player.uuid);
		if (!profiles) return 0;

		for (const profile of profiles.values()) {
			if (level < profile.level) {
				level = profile.level;
			}
		}
		return level;
	},

	current: async function (player) {
		const profiles = await hypixel.getSkyblockMember(player.uuid);
		if (!profiles) return 0;

		const profile = [...profiles.values()].find((profile) => profile.selected);
		return profile.level;
	}
};

const cataXP = JSON.parse(fs.readFileSync('./assets/dungeon_levels.json', 'utf8')); // Credits: https://github.com/Hypixel-API-Reborn/hypixel-api-reborn
// const floors = JSON.parse(fs.readFileSync('./assets/dungeon_floors.json', 'utf8'));

const getCata = {
	highest: async function (uuid, floor = null) {
		const response = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?key=${auth.hypixelAPI}&uuid=${uuid}`);
		const data = await response.json();
		const profile = data.profiles.find(profile => profile.selected);
		const dungeons = profile.members[uuid].dungeons;

		const totalRuns =
			dungeons.dungeon_types.catacombs.times_played[0] +
			dungeons.dungeon_types.catacombs.times_played[1] +
			dungeons.dungeon_types.catacombs.times_played[2] +
			dungeons.dungeon_types.catacombs.times_played[3] +
			dungeons.dungeon_types.catacombs.times_played[4] +
			dungeons.dungeon_types.catacombs.times_played[5] +
			dungeons.dungeon_types.catacombs.times_played[6] +
			dungeons.dungeon_types.catacombs.times_played[7] +
			dungeons.dungeon_types.master_catacombs.times_played[1] +
			dungeons.dungeon_types.master_catacombs.times_played[2] +
			dungeons.dungeon_types.master_catacombs.times_played[3] +
			dungeons.dungeon_types.master_catacombs.times_played[4] +
			dungeons.dungeon_types.master_catacombs.times_played[5] +
			dungeons.dungeon_types.master_catacombs.times_played[6] +
			dungeons.dungeon_types.master_catacombs.times_played[7]

		const cataData = {
			level: getCataLevels.overflow(dungeons.dungeon_types.catacombs.experience).toFixed(1),
			healer: Math.floor(getCataLevels.overflow(dungeons.player_classes.healer.experience)),
			mage: Math.floor(getCataLevels.overflow(dungeons.player_classes.mage.experience)),
			berserk: Math.floor(getCataLevels.overflow(dungeons.player_classes.berserk.experience)),
			archer: Math.floor(getCataLevels.overflow(dungeons.player_classes.archer.experience)),
			tank: Math.floor(getCataLevels.overflow(dungeons.player_classes.tank.experience)),
			classAvg: (function() {
				const levels = [
				  dungeons.player_classes.healer.experience,
				  dungeons.player_classes.mage.experience,
				  dungeons.player_classes.berserk.experience,
				  dungeons.player_classes.archer.experience,
				  dungeons.player_classes.tank.experience
				];
				if (levels.some(xp => getCataLevels.overflow(xp) < 50)) {
				  return (
					getCataLevels.capped(dungeons.player_classes.healer.experience) +
					getCataLevels.capped(dungeons.player_classes.mage.experience) +
					getCataLevels.capped(dungeons.player_classes.berserk.experience) +
					getCataLevels.capped(dungeons.player_classes.archer.experience) +
					getCataLevels.capped(dungeons.player_classes.tank.experience)
				  ) / 5;
				}
				else {
				  return (
					getCataLevels.overflow(dungeons.player_classes.healer.experience) +
					getCataLevels.overflow(dungeons.player_classes.mage.experience) +
					getCataLevels.overflow(dungeons.player_classes.berserk.experience) +
					getCataLevels.overflow(dungeons.player_classes.archer.experience) +
					getCataLevels.overflow(dungeons.player_classes.tank.experience)
				  ) / 5;
				}
			  })().toFixed(1),
			secrets: dungeons.secrets,
			spr: Number((dungeons.secrets / totalRuns).toFixed(1))
		};

		if (floor) {
			const scoreData = this.getScore(dungeons, floor);
			return {
				...cataData,
				score: scoreData.rank ?? null,
				time: scoreData ? this.formatMs(scoreData.time) : null,
				runs: dungeons.dungeon_types[floor[0] === 'f' ? 'catacombs' : 'master_catacombs'].tier_completions[floor[1]],
				collection: dungeons.dungeon_types.catacombs.tier_completions[floor[1]] + ((dungeons.dungeon_types.master_catacombs.tier_completions[floor[1]] * 2))
			};
		}

		return cataData;
	},

	current: async function (uuid, floor = null) {
		const response = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?key=${auth.hypixelAPI}&uuid=${uuid}`);
		const data = await response.json();
		const profile = data.profiles.find(profile => profile.selected);
		const dungeons = profile.members[uuid].dungeons;

		const totalRuns =
			dungeons.dungeon_types.catacombs.times_played[0] +
			dungeons.dungeon_types.catacombs.times_played[1] +
			dungeons.dungeon_types.catacombs.times_played[2] +
			dungeons.dungeon_types.catacombs.times_played[3] +
			dungeons.dungeon_types.catacombs.times_played[4] +
			dungeons.dungeon_types.catacombs.times_played[5] +
			dungeons.dungeon_types.catacombs.times_played[6] +
			dungeons.dungeon_types.catacombs.times_played[7] +
			dungeons.dungeon_types.master_catacombs.times_played[1] +
			dungeons.dungeon_types.master_catacombs.times_played[2] +
			dungeons.dungeon_types.master_catacombs.times_played[3] +
			dungeons.dungeon_types.master_catacombs.times_played[4] +
			dungeons.dungeon_types.master_catacombs.times_played[5] +
			dungeons.dungeon_types.master_catacombs.times_played[6] +
			dungeons.dungeon_types.master_catacombs.times_played[7]

		const cataData = {
			level: getCataLevels.overflow(dungeons.dungeon_types.catacombs.experience).toFixed(1),
			healer: Math.floor(getCataLevels.overflow(dungeons.player_classes.healer.experience)),
			mage: Math.floor(getCataLevels.overflow(dungeons.player_classes.mage.experience)),
			berserk: Math.floor(getCataLevels.overflow(dungeons.player_classes.berserk.experience)),
			archer: Math.floor(getCataLevels.overflow(dungeons.player_classes.archer.experience)),
			tank: Math.floor(getCataLevels.overflow(dungeons.player_classes.tank.experience)),
			classAvg: (function() {
				const levels = [
				  dungeons.player_classes.healer.experience,
				  dungeons.player_classes.mage.experience,
				  dungeons.player_classes.berserk.experience,
				  dungeons.player_classes.archer.experience,
				  dungeons.player_classes.tank.experience
				];
				if (levels.some(xp => getCataLevels.overflow(xp) < 50)) {
				  return (
					getCataLevels.capped(dungeons.player_classes.healer.experience) +
					getCataLevels.capped(dungeons.player_classes.mage.experience) +
					getCataLevels.capped(dungeons.player_classes.berserk.experience) +
					getCataLevels.capped(dungeons.player_classes.archer.experience) +
					getCataLevels.capped(dungeons.player_classes.tank.experience)
				  ) / 5;
				}
				else {
				  return (
					getCataLevels.overflow(dungeons.player_classes.healer.experience) +
					getCataLevels.overflow(dungeons.player_classes.mage.experience) +
					getCataLevels.overflow(dungeons.player_classes.berserk.experience) +
					getCataLevels.overflow(dungeons.player_classes.archer.experience) +
					getCataLevels.overflow(dungeons.player_classes.tank.experience)
				  ) / 5;
				}
			  })().toFixed(1),
			secrets: dungeons.secrets,
			spr: Number((dungeons.secrets / totalRuns).toFixed(1))
		};

		if (floor) {
			const scoreData = this.getScore(dungeons, floor);
			return {
				...cataData,
				score: scoreData.rank ?? null,
				time: scoreData ? this.formatMs(scoreData.time) : null,
				runs: dungeons.dungeon_types[floor[0] === 'f' ? 'catacombs' : 'master_catacombs'].tier_completions[floor[1]],
				collection: dungeons.dungeon_types.catacombs.tier_completions[floor[1]] + ((dungeons.dungeon_types.master_catacombs.tier_completions[floor[1]] * 2))
			};
		}

		return cataData;
	},

	getScore(dungeons, floor) {
		if (dungeons.dungeon_types[floor[0] === 'f' ? 'catacombs' : 'master_catacombs'].fastest_time_s_plus?.[floor[1]]) return { rank: 'S+', time: dungeons.dungeon_types[floor[0] === 'f' ? 'catacombs' : 'master_catacombs'].fastest_time_s_plus?.[floor[1]] };
		else if (dungeons.dungeon_types[floor[0] === 'f' ? 'catacombs' : 'master_catacombs'].fastest_time_s?.[floor[1]]) return { rank: 'S', time: dungeons.dungeon_types[floor[0] === 'f' ? 'catacombs' : 'master_catacombs'].fastest_time_s?.[floor[1]] };
		else if (dungeons.dungeon_types[floor[0] === 'f' ? 'catacombs' : 'master_catacombs'].fastest_time?.[floor[1]]) return { rank: 'No Score', time: dungeons.dungeon_types[floor[0] === 'f' ? 'catacombs' : 'master_catacombs'].fastest_time?.[floor[1]] };
		else return null;
	},

	formatMs(ms) {
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	// highest: async function (player, floor = null) {
	// 	let cata;

	// 	const profiles = await hypixel.getSkyblockProfiles(player.uuid);
	// 	if (!profiles) return null;

	// 	let thisCata = 0;
	// 	for (const profile of profiles.values()) {
	// 		if (profile.me.dungeons.experience.level > thisCata) {
	// 			thisCata = profile.me.dungeons.experience.level;
	// 			cata = profile.me.dungeons;
	// 		}
	// 	}

	// 	const data = {
	// 		level: getOverflowLevel(cata.experience.xp),
	// 		healer: cata.classes.healer.level,
	// 		mage: cata.classes.mage.level,
	// 		berserk: cata.classes.berserk.level,
	// 		archer: cata.classes.archer.level,
	// 		tank: cata.classes.tank.level,
	// 		classAvg: (cata.classes.healer.level + cata.classes.mage.level + cata.classes.berserk.level + cata.classes.archer.level + cata.classes.tank.level) / 5,
	// 		secrets: cata.secrets.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
	// 		spr: Number((cata.secrets / (cata.completions.catacombs.total + cata.completions.masterCatacombs.total)).toFixed(2))
	// 	};

	// 	if (floor) {
	// 		const run = this.getFloor(cata, floor);

	// 		return {
	// 			...data,
	// 			score: run.score,
	// 			time: run.time,
	// 			runs: run.runs,
	// 			collection: run.collection
	// 		};
	// 	}

	// 	return data;
	// },

	// current: async function (player, floor = null) {
	// 	const profiles = await hypixel.getSkyblockProfiles(player.uuid);
	// 	if (!profiles) return null;

	// 	const profile = [...profiles.values()].find((profile) => profile.selected);
	// 	const cata = profile.me.dungeons;

	// 	const data = {
	// 		level: getOverflowLevel(cata.experience.xp),
	// 		healer: cata.classes.healer.level,
	// 		mage: cata.classes.mage.level,
	// 		berserk: cata.classes.berserk.level,
	// 		archer: cata.classes.archer.level,
	// 		tank: cata.classes.tank.level,
	// 		classAvg: (cata.classes.healer.level + cata.classes.mage.level + cata.classes.berserk.level + cata.classes.archer.level + cata.classes.tank.level) / 5,
	// 		secrets: cata.secrets.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
	// 		spr: Number((cata.secrets / (cata.completions.catacombs.total + cata.completions.masterCatacombs.total)).toFixed(2))
	// 	};

	// 	if (floor) {
	// 		const run = this.getFloor(cata, floor);

	// 		return {
	// 			...data,
	// 			score: run.score,
	// 			time: run.time,
	// 			runs: run.runs,
	// 			collection: run.collection
	// 		};
	// 	}

	// 	return data;
	// },

	// getFloor(cata, floor) {
	// 	const floorInfo = floors.find(f => f.id === floor);
	// 	if (!floorInfo) return null;

	// 	const { name, path } = floorInfo;
	// 	const floorData = cata.floors[name];
	// 	if (!floorData) return null;

	// 	const getRuns = [
	// 		floorData.fastestSPlusRun,
	// 		floorData.fastestSRun,
	// 		floorData.fastestRun
	// 	].filter(Boolean);

	// 	if (getRuns.length === 0) return null;

		// function getScore(run) {
		// 	return run.score_exploration + run.score_speed + run.score_skill + run.score_bonus;
		// }

	// 	const highestRun = getRuns.reduce((best, run) => {
	// 		return getScore(run) > getScore(best) ? run : best;
	// 	}, getRuns[0]);

	// 	let rank;
	// 	const score = getScore(highestRun);
	// 	if (score >= 300) rank = 'S+';
	// 	else if (score >= 269.5) rank = 'S';
	// 	else if (score >= 230) rank = 'A';
	// 	else if (score >= 160) rank = 'B';
	// 	else if (score >= 100) rank = 'C';
	// 	else rank = 'D';

	// 	const totalSeconds = Math.floor(highestRun.elapsed_time / 1000);
	// 	const minutes = Math.floor(totalSeconds / 60);
	// 	const seconds = totalSeconds % 60;
	// 	const time = `${minutes}:${seconds.toString().padStart(2, '0')}`;

	// 	const runs = floor.startsWith('m')
	// 		? cata.completions.masterCatacombs?.[path]
	// 		: cata.completions.catacombs?.[path];

	// 	const normalRuns = cata.completions.catacombs?.[path] ?? 0;
	// 	const masterRuns = cata.completions.masterCatacombs?.[path] ?? 0;
	// 	const collection = normalRuns + (masterRuns * 2);

	// 	return {
	// 		score: rank,
	// 		time,
	// 		runs,
	// 		collection
	// 	};
	// }
};

const getCataLevels = {
	overflow(xp) {
	  let requiredXP = 0;
	  for (let i = 1; i <= 50; i++) {
		const levelXp = cataXP[i];
		if (xp < requiredXP + levelXp) {
		  return i - 1 + (xp - requiredXP) / levelXp;
		}
		requiredXP += levelXp;
	  }
	  return 50 + (xp - requiredXP) / 200000000;
	},

	capped(xp) {
	  let requiredXP = 0;
	  for (let i = 1; i <= 50; i++) {
		const levelXp = cataXP[i];
		if (xp < requiredXP + levelXp) {
		  return i - 1 + (xp - requiredXP) / levelXp;
		}
		requiredXP += levelXp;
	  }
	  return 50;
	}
};

const getNw = {
	highest: async function (player) {
		let nw;

		const profiles = await hypixel.getSkyblockMember(player.uuid);
		if (!profiles) return null;

		let thisNw = 0;
		for (const profile of profiles.values()) {
			const networth = await profile.getNetworth();
			if (networth.networth > thisNw) {
				thisNw = networth.networth;
				nw = networth;
			}
		}

		return {
			networth: nFormat(nw.networth),
			purse: nFormat(nw.purse),
			bank: nFormat(nw.bank)
		};
	},

	current: async function (player) {
		const profiles = await hypixel.getSkyblockMember(player.uuid);
		if (!profiles) return null;

		const profile = [...profiles.values()].find((profile) => profile.selected);
		const nw = await profile.getNetworth();

		return {
			networth: nFormat(nw.networth),
			purse: nFormat(nw.purse),
			bank: nFormat(nw.bank)
		};
	}
};

function nFormat(value) {
	if (value >= 1e12) return (Math.floor(value / 1e10) / 100).toFixed(2) + 'T';
	if (value >= 1e9) return (Math.floor(value / 1e8) / 10).toFixed(1) + 'B';
	if (value >= 1e6) return Math.floor(value / 1e6) + 'M';
	if (value >= 1e3) return Math.floor(value / 1e3) + 'k';
	return Math.floor(value.toString());
}

const getSlayers = {
	highest: async function (player) {
		let slayers = {};

		const profiles = await hypixel.getSkyblockMember(player.uuid);
		if (!profiles) return null;

		for (const profile of profiles.values()) {
			const slayer = await profile.getSlayerXP();
			if (slayer) {
				slayers = slayer;
			}
		}

		return slayers;
	},

	current: async function (player) {
		const profiles = await hypixel.getSkyblockMember(player.uuid);
		if (!profiles) return null;

		const profile = [...profiles.values()].find((profile) => profile.selected);
		const slayer = await profile.getSlayerXP();

		return slayer;
	}
};

const config = readConfig();
const colors = JSON.parse(fs.readFileSync('./assets/colors.json', 'utf8'));

async function createImage(text) {
	const canvasWidth = 1100;
	const fontSize = config.bridge.font.size;
	const fontName = config.bridge.font.name;
	const lineHeight = 40;

	const blank = Canvas.createCanvas(1, 1);
	const blankCTX = blank.getContext('2d');
	blankCTX.font = `${fontSize}px ${fontName}`;

	const colorMap = {};
	colors.forEach(color => {
		colorMap[color.code] = color;
	});

	const parts = [];
	let index = 0;
	while (index < text.length) {
		if (text[index] === '§' && index + 1 < text.length) {
			const code = `§${text[index + 1]}`;
			index += 2;
			let message = '';
			while (index < text.length && text[index] !== '§') {
				message += text[index];
				index++;
			}
			parts.push({ code, message });
		}
		else {
			let message = '';
			while (index < text.length && text[index] !== '§') {
				message += text[index];
				index++;
			}
			if (message.length > 0) {
				parts.push({ code: '§f', message });
			}
		}
	}

	const lines = [];
	let currentLine = [];
	let currentLineWidth = 0;

	for (const part of parts) {
		const { code, message } = part;
		const words = message.split(' ');

		for (let i = 0; i < words.length; i++) {
			const word = words[i];
			const wordWidth = blankCTX.measureText(word).width;
			const spaceWidth = i > 0 ? blankCTX.measureText(' ').width : 0;

			if (currentLineWidth + wordWidth + spaceWidth > canvasWidth - 20) {
				lines.push(currentLine);
				currentLine = [];
				currentLineWidth = 0;
				currentLine.push({ code, text: word });
				currentLineWidth = wordWidth;
			}
			else {
				const textToAdd = currentLineWidth > 0 && i > 0 ? ` ${word}` : word;
				currentLine.push({ code, text: textToAdd });
				currentLineWidth += wordWidth + spaceWidth;
			}
		}
	}

	if (currentLine.length > 0) {
		lines.push(currentLine);
	}

	const canvasHeight = lines.length * lineHeight;
	const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	ctx.font = `${fontSize}px ${fontName}`;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		let xOffset = 20;
		const textYPosition = (i * lineHeight) + 28;

		for (const part of line) {
			const colorData = colorMap[part.code] || colorMap['§f'];

			ctx.fillStyle = colorData.shadow;
			ctx.fillText(part.text, xOffset + 4, textYPosition + 4);

			ctx.fillStyle = colorData.hex;
			ctx.fillText(part.text, xOffset, textYPosition);

			xOffset += ctx.measureText(part.text).width;
		}
	}

	const buffer = canvas.toBuffer('image/png');
	return new AttachmentBuilder(buffer, { name: 'image.png' });
}

const messageQ = [];

function send(channel, user = null, content, discordMessage = null) {
	messageQ.push({ channel, user, content, discordMessage });
}
