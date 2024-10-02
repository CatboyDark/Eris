const HAPI = require('../../../helper/hapi.js');
const hypixel = require('./hapi.js');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

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
    if (current[key] === undefined) return console.log(`Path not found: ${path}`);
    current = current[key];
  }

  if (typeof current[lastKey] !== 'boolean') return console.log('This is not a valid config!');
  current[lastKey] = !current[lastKey];

  writeConfig(config);
}

function scanDir(dir) {
  let files = [];

  const items = fs.readdirSync(dir);
  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(scanDir(fullPath));
    } else {
      files.push(fullPath);
    }
  });

  return files;
}

function readLogic() {
  const foundModules = scanDir('./src/discord/logic')
    .filter((module) => module.endsWith('.js'))
    .map((path) => path.split('src/discord/logic/')[1]);

  const modules = {};
  foundModules.forEach((modulePath) => {
    console.log(modulePath);
    console.log(`./src/discord/logic/${modulePath}`);
    const moduleData = require(`../discord/logic/${modulePath}`);
    if (modules[modulePath.split('/')[0]] === undefined) modules[modulePath.split('/')[0]] = {};
    modules[modulePath.split('/')[0]][modulePath.split('/')[1].split('.js')[0]] = moduleData;
  });

  return modules;
}

async function getIGN(userData, uuid) {
  try {
    const response = await axios.get(`https://mowojang.matdoes.dev/${uuid}`, {
      headers: {
        'User-Agent': `Discord: @${userData.username} (${userData.id})`
      }
    });
    return response.data.data.player.username;
  } catch (error) {
    console.error('Error fetching username for UUID:', error);
    return null;
  }
}

function getDiscord(player) {
  const discord = player.socialMedia.find((media) => media.id === 'DISCORD') || null;
  return discord ? discord.link.toLowerCase() : null;
}

async function getSBLevelHighest(uuid) {
  let highestLevel = 0;
  const sbProfiles = await hypixel.getSkyblockProfiles(uuid).catch(() => null);
  if (null === sbProfiles) return highestLevel;
  sbProfiles.forEach((profile) => {
    const currentLevel = profile.me?.level || 0;
    if (currentLevel > highestLevel) highestLevel = currentLevel;
  });
  if (highestLevel > 50) highestLevel = 50;
  return highestLevel;
}

async function getCataHighest(uuid) {
  let highestLevel = 0;
  const sbProfiles = await hypixel.getSkyblockProfiles(uuid).catch(() => null);
  if (null === sbProfiles) return highestLevel;
  sbProfiles.forEach((profile) => {
    const currentLevel = profile.me?.dungeons.experience.level || 0;
    if (currentLevel > highestLevel) highestLevel = currentLevel;
  });
  if (highestLevel > 50) highestLevel = 50;
  return highestLevel;
}

async function updateRoles(member, uuid, addLinkRole = false) {
  const config = readConfig();
  const guild = await HAPI.getGuild('player', uuid);

  const addedRoles = [];
  const removedRoles = [];

  // Assign Link Role
  if (addLinkRole) {
    if (config.features.linkRoleToggle) {
      if (!member.roles.cache.has(config.features.linkRole)) {
        await member.roles.add(config.features.linkRole);
        addedRoles.push(config.features.linkRole);
      }
    }
  }

  // Assign Guild Role
  if (config.features.guildRoleToggle) {
    if (guild && guild.name === config.guild) {
      if (!member.roles.cache.has(config.features.guildRole)) {
        await member.roles.add(config.features.guildRole);
        addedRoles.push(config.features.guildRole);
      }
    } else if (member.roles.cache.has(config.features.guildRole)) {
      await member.roles.remove(config.features.guildRole);
      removedRoles.push(config.features.guildRole);
    }
  }

  // Assign Guild Ranks Roles
  if (config.features.guildRankRolesToggle) {
    if (guild && guild.name === config.guild) {
      const gmember = guild.members.find((member) => member.uuid === uuid);
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

  // Assign SB Level Role
  if (config.features.levelRolesToggle) {
    const level = await getSBLevelHighest(uuid);
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

  // Assign SB Cata Role
  if (config.features.cataRolesToggle) {
    const cataHighest = await getCataHighest(uuid);
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

module.exports = {
  readConfig,
  writeConfig,
  toggleConfig,
  readLogic,
  getIGN,
  getDiscord,
  getSBLevelHighest,
  getCataHighest,
  updateRoles
};
