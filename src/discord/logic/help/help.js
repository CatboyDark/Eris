const { createMsg, createRow } = require('../../../helper/builder.js');
const { readConfig } = require('../../../helper/utils.js');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

function getPermissionName(permissionBit) {
  return Object.keys(PermissionFlagsBits).find((key) => {
    return PermissionFlagsBits[key] === permissionBit;
  });
}

function hasPermission(permissions, userPermissions = false, hasAdminPermission = false) {
  if (hasAdminPermission) return true;
  if (permissions.length === 0) return true;
  const permissionBits = permissions.reduce((acc, perm) => {
    const permBit = PermissionFlagsBits[perm];
    return acc | BigInt(permBit);
  }, BigInt(0));
  return (userPermissions & permissionBits) === permissionBits;
}

function formatCommands(commands) {
  return commands
    .sort((a, b) => {
      return a.name.localeCompare(b.name);
    })
    .map((cmd) => {
      let description = `- **\`/${cmd.name}\`** ${cmd.desc}`;
      if (cmd.permissions && cmd.permissions.length > 0) {
        const permissionsRequired = cmd.permissions
          .map((perm) => {
            return getPermissionName(PermissionFlagsBits[perm]);
          })
          .join(', ');
        description += ` **(${permissionsRequired})**`;
      }
      return description;
    })
    .join('\n');
}

function createHelpMsg(interaction) {
  const config = readConfig();
  const cmds = fs
    .readdirSync('./src/discord/slash')
    .filter((file) => {
      return file.endsWith('.js');
    })
    .map((file) => {
      return require(`./src/discord/slash/${file}`);
    })
    .filter((command) => {
      return command && command.name && command.desc;
    });

  const userPermissions = BigInt(interaction.member.permissions.bitfield);
  const staffList = cmds.filter((cmd) => {
    return (
      cmd.permissions &&
      cmd.permissions.length > 0 &&
      hasPermission(
        cmd.permissions,
        userPermissions,
        (userPermissions & PermissionFlagsBits.Administrator) === PermissionFlagsBits.Administrator
      )
    );
  });

  const nonCommands = `**Commands**\n${formatCommands(
    cmds.filter((cmd) => {
      return !cmd.permissions || cmd.permissions.length === 0;
    })
  )}`;

  return createMsg({
    icon: config.icon,
    title: config.guild,
    desc: `${nonCommands}${staffList.length > 0 ? `\n\n**Staff Commands**\n${formatCommands(staffList)}` : ''}`,
    footer: 'Created by @CatboyDark',
    footerIcon: 'https://i.imgur.com/4lpd01s.png'
  });
}

async function cmds(interaction) {
  const embed = createHelpMsg(interaction);
  const replyData = {
    embeds: [embed],
    components: [
      createRow([
        { id: 'MCcmds', label: 'Ingame Commands', style: 'Green' },
        { id: 'credits', label: 'Credits', style: 'Blue' },
        { id: 'support', label: 'Support', style: 'Blue' },
        { label: 'GitHub', url: 'https://github.com/CatboyDark/Eris' }
      ])
    ]
  };

  if (interaction.isButton()) {
    await interaction.update(replyData);
  } else {
    await interaction.reply(replyData);
  }
}

module.exports = { cmds };
