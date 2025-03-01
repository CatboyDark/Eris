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
`logsChannel` Bot logs channel  
`prefix` Discord and Ingame command prefix

5. **Run the bot**
```bash
  node start.js
```

## Features

- **Discord Welcome Message and Role**

	Send a message when a member joins the server:
	- `welcome > messageToggle: true`  
	- `welcome > channel` Enter a channel ID to send the message.  
	- `welcome > message` Customize the message. Leave empty for default. Type @member to ping the member.
  
	Assign new members a role:
	- `welcome > roleToggle: true`  
	- `welcome > role` Enter a role ID.
  
- **Account Linking**

	Link your Discord account to Hypixel to auto-assign custom roles.
	Type `.setlink` in a channel to set it as the linking channel. Also send the linking message. Optional but recommended.
	- `link > roleToggle` Assign a role when a user links their account.
	- `link > role` Enter a role ID.
  
	Roles with `DeleteMessages` permission can enter `clear` to clear messages in the linking channel.

	**These features will not work if members aren't linked:**
	- asdf
  
  
- **Guild Roles**

	Assign guild members a role when they link their account.
	- `guild > name` Enter a guild name.
	- `guild > roleToggle: true`
 	- `guild > role` Enter a role ID.

	Assign guild members a role based on their guild rank when they link their account.
	- `guild > rankRoles: true`
	- `guild > rankRoles > rank:` Enter a guild rank name.
	- `guild > rankRoles > role` Enter a role ID.

 - **Permissions**

   	Custom Bot Permissions:
   	- `Owner`:
   	- `Admin`: has all perms except Owner
   	- `setLinkChannel`
   	- `DeleteMessages`
   	- `RestartBot`
   	- `LinkOverride`

---

> [!NOTE]
> This project values minimalism.  
> Contributors will not recieve any credits on the frontend, except for the credits section within `/help`.

Created by CatboyDark  
2024' 07' 11
