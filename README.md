> [!CAUTION]
> The app is undergoing active development, and is NOT ready for public use.

# Eris

A Discord-Minecraft bot for Hypixel Skyblock guilds.

**Built using:**

DiscordJS
Mineflayer
Skyhelper Networth
<br />
## Prerequisites
- [Minecraft Alt Account](#minecraft-alt-account)
- [Hosting](#hosting)
- [Git](#git)

### Minecraft Alt Account
To utilize the Minecraft-Discord chat bridge, guild commands, and other ingame features, you will need a Minecraft account.
You may also choose to set up without one.

> [!NOTE]
> The app uses Mineflayer, a non-standard Minecraft client to access Hypixel. Nobody has EVER had an issue with this, but the odds are never zero. Additionally, the account may incur chat infractions if reported for messages sent through the guild chat bridge.
> It is advised to be cautious and moderate your guild. I hold no responsibility for any punishments resulting from the app's usage.

### Hosting
If you want the app to run 24/7, you will need a host for it. You may use an old laptop that you have lying around, or purchase a subscription from a cloud hosting service.

Recommended minimum requirements:
- 1 CPU core
- 1 GB RAM
- 1 GB disk space

> [!NOTE]
> As of June 2026,
> [Linode](https://www.akamai.com/cloud/pricing) offers a $5 monthly Shared CPU plan "Nanode 1 GB" that meets these requirements.
> [Digital Ocean](https://www.digitalocean.com/pricing/droplets) offers a viable alternative.

Debian Linux is the preferred operating system of choice for its minimal design and efficiency.

### Git
[Git](https://git-scm.com/install/) is the utility that downloads and manages updates for the app.

To confirm its installation, run `git --version` in the terminal (Command Prompt on Windows).
If you get a response "command not found", you will need to install it.

To install it on Debian, run:
```
apt-get install git
```
Otherwise, select the operating system you're working with and follow the instructions.

## Installation
- [PM2 vs Docker](#pm2-vs-docker)
- [PM2](#pm2)
- [Docker](#docker)

### PM2 vs Docker
You will want a process that keeps the app running.

> PM2 has a quick and easy setup. However, if you plan on utilizing this app to continually track guild metrics (like logging members' guild xp), you will have to manually set up MongoDB later on.

> Docker is a utility that wraps this app in a nice little package, granting full app functionality but with a more complicated setup.

### PM2
[NodeJS](https://nodejs.org/en/download) is what runs this app.
For Debian or other Linux distributions: Get Node.js `LTS` for `Linux` using `nvm` with `npm`.
For Windows and macOS, you may select a prebuilt version right below and set that up.

To install [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/), run:
```
npm install pm2 -g
```

Download the project using:
```
git clone https://github.com/CatboyDark/Eris.git
```

MongoDB (Optional)

// insert mongo setup here

### Docker

For Debian or other linux distributions (without a GUI), you want the [Docker Engine](https://docs.docker.com/engine/install/debian/).
On Windows or Mac, you want [Docker Desktop](https://docs.docker.com/get-started/get-docker/).
Visit the corresponding links. Select the operating system you're working with and follow the instructions.

To confirm its installation, run `docker --version`.

// continue docker setup here

## Setup
Congratulations. The hard part is over. You may take a breath.

- [Initializing](#initializing)
- [Discord Bot](#discord-bot)
- [Hypixel API](#hypixel-api)
- [MongoDB](#mongodb)
- [Configurating](#configuring)

### Initializing
Run using PM2:
```
pm2 start Eris/start.js --name Eris && pm2 logs Eris
```

Run using Docker:
```
// run using docker
```

// okay idk yet. how do you edit auth.json and config.json over cli prompts with pm2 or docker?
// also, add a reassuring statement: If you ever fuck up the initiation process, don't stress. Press Ctrl + C and rerun it. (note. add a separate command for initiation vs regular running.)

### Discord Bot
1. Visit the [Discord Developers](https://discord.com/developers/applications) page and log in.
2. Select "New Application" at the top right.
3. You may choose a name, profile picture, banner, and bio for your bot.
4. Navigate to "Installation" at the left.
5. Under "Default Install Settings", "Guild Install", add "bot" to "Scopes".
6. Assign the following permissions (or alternatively, assign Administrator):
 - Create Public Threads
 - Manage Channels
 - Manage Roles
 - Manage Messages
 - Manage Nicknames
 - Moderate Members
 - View Audit Log
7. Navigate to "Bot" at the left.
8. Under "Token", reset your token.

### Hypixel API
1. Visit the [Hypixel Developers](https://developer.hypixel.net/) page and log in.
2. Select "Regenerate API Key".

> [!NOTE]
> This key will expire. Eventually, you will need to apply for a developer key in the "Applications" section. This process may take a week or two. I hear they're pretty harsh, so be sure to provide a thorough description. Good luck, soldier! <o

### MongoDB
If you set up mongo:
// get mongo uri

### Configuring
// configure config.json... or not? cli prompts cough cough

### Useful Commands

#### PM2
To manage processes:
```
pm2 start Eris
pm2 restart Eris
pm2 stop Eris
pm2 delete Eris
```

To view status:
```
pm2 status
```

To view logs:
```
pm2 logs Eris
pm2 logs Eris --lines 50
```

#### Docker
```
// docker commands blah blah
```

## Documentation
- [Prefix]
- [Server ID]
- [IGN]
- [Guild ID]
- [Logs]
- [Skyblock News]
- [Chat Bridge]
- [Welcome]
- [Debug]


## Credits
**[Hypixel-API-Reborn](https://github.com/Hypixel-API-Reborn/hypixel-api-reborn)**
- assets/cataXP.json
- assets/skillXP.json

**[hypixel-discord-chat-bridge](https://github.com/DuckySoLucky/hypixel-discord-chat-bridge)**
- assets/forge.json

**[Hypixel Fandom](https://hypixel.fandom.com/wiki/)**
- assets/hypixelStaff.jsonc

<br />
<br />

Created by CatboyDark
2024.07.11
