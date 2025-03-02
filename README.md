<h1 align="center">
Eris
</h1>

A Discord bot for Hypixel Skyblock.

Built using:

> [discord.js](https://github.com/discordjs/guide)
>
> [mineflayer](https://github.com/PrismarineJS/mineflayer)
>
> [hypixel-api-reborn](https://github.com/Hypixel-API-Reborn/hypixel-api-reborn)

## Setup

1. **Install the necessary dependencies**

```bash
  npm install
```

2. **Install MongoDB**

```bash
  https://www.mongodb.com/docs/manual/administration/install-community/
```

3. **Edit auth.json**
`token` Discord bot token
`hypixelAPI` Hypixel API token

4. **Edit config.json**
`color` Main bot color
`prefix` Discord and Ingame command prefix
`logsChannel` Bot logs channel

5. **Run the bot**
```bash
  node start.js
```

## Features

- **Discord Welcome Message and Role**

	Send a message when a member joins the server:
	- `welcome > message > enabled: true`
	- `welcome > message > channel` Enter a channel ID to send the message.
	- `welcome > message > message` Customize the message. Leave empty for default. Type @member to ping the member.

	Assign new members a role:
	- `welcome > role > enabled: true`
	- `welcome > role > role` Enter a role ID.

- **Account Linking**

	Link your Discord account to Hypixel to auto-assign custom roles.
	Type `.setlink` in a channel to set it as the linking channel. Also send the linking message. Optional but recommended.
	- `link > role > enabled: true` Assign a role when a user links their account.
	- `link > role > role` Enter a role ID.

	Roles with `DeleteMessages` permission can enter `clear` to clear messages in the linking channel.

	**These features will not work if members aren't linked:**
	- asdf

- **Guild Roles**

	Assign guild members a role when they link their account.
	- `guild > name` Enter a guild name.
	- `guild > role > enabled: true`
 	- `guild > role > role` Enter a role ID.

	Assign guild members a role based on their guild rank when they link their account.
	- `guild > rankRoles > enabled: true`
	- `guild > rankRoles > roles > rank:` Enter a guild rank name.
	- `guild > rankRoles > roles > role` Enter a role ID.

 - **Permissions**

   	Custom Bot Permissions:
   	- `Owner`:
   	- `Admin`: has all perms except Owner
   	- `SetLinkChannel`
	- `SetMapChannel`
   	- `DeleteMessages`
   	- `RestartBot`
   	- `LinkOverride`

---

> [!NOTE]
> This project values minimalism.
> Contributors will not recieve any credits on the frontend, except for the credits section within `/help`.

Created by CatboyDark
2024' 07' 11
