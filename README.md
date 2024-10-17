<h1 align="center">
    Eris
</h1>

A Discord/Minecraft bot for Hypixel Skyblock, built using:

> [discord.js](https://github.com/discordjs/guide)
>
> [mineflayer](https://github.com/PrismarineJS/mineflayer)
>
> [hypixel-api-reborn](https://github.com/Hypixel-API-Reborn/hypixel-api-reborn)

## Features (WIP)

### Guild:

- Hypixel-Discord chat bridge
- Auto-accept join requests
- Skyblock commands

### Discord:

- CENTRAL verification system
- Custom Skyblock roles
- Moderation tools
- And more!

## How To Setup

### 1. Install the necessary dependencies

```bash
  pnpm install
```

### 2. Configure config.json

Rename exampleconfig.json → config.json

> token: Discord Token (https://discord.com/developers/applications)
>
> appID: Discord Application ID
>
> hypixelAPI: Hypixel API Key (https://developer.hypixel.net/)
>
> ign: Minecraft Bot Username

### 3. Run/host the bot

```bash
  node start.js
```

OR host it use [PM2](https://pm2.keymetrics.io/)

### 4. Run /setup to adjust configs and enable features

> [!NOTE] You need the Manage Server permission to do this.

---

> [!NOTE] This project values minimalism. Contributors will not recieve any credits on the frontend, with the exception
> of the credits section within the `/help` command.

Created by CatboyDark on July 11, 2024.
