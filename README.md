<h1 align="center">
Eris
</h1>

A Discord/Hypixel bot. For Skyblock guilds.

## Installation

1. **Install MongoDB**

```
  https://www.mongodb.com/docs/manual/administration/install-community/
```

2. **Install dependencies**

```
  npm install
```

3. **Edit auth.json**  
`token` Discord bot token   
`hypixelAPI` Hypixel API key

4. **Edit config.json**  
`color` Main bot HEX color  
`logsChannel` Main bot channel ID

5. **Run the bot**
```bash
  node start.js
```

## Features

### Discord Welcome Message and Role
Send a message when a new member joins the server:  
`welcome > message > enabled: true`  
`welcome > message > channel` Enter a channel ID to send the message.  
`welcome > message > message` Customize the message. Leave empty for default. Type @member to ping the member. 

Assign new members a role:  
`welcome > role > enabled: true`  
`welcome > role > role` Enter a role ID.  
<br>

### Account Linking
Link your Discord account to Hypixel to auto-assign custom roles.  
Type `.setlink` in a channel to set it as the linking channel (Requires permission: `SetLinkChannel`). Optional but recommended.  
`link > role > enabled: true` Assign a role when a user links their account.  
`link > role > role` Enter a role ID.

Roles with `DeleteMessages` permission can enter `clear` to clear messages in the linking channel.  
<br>

### Discord Servers List
Advertise useful Skyblock discords with their official server links.  
Type `.setmap` in a channel to set it as the server list channel (Requires permission: `SetMapChannel`).  
<br>

### Guild Roles
Assign guild members a role when they link their account.  
`guild > name` Enter a guild name.  
`guild > role > enabled: true`  
`guild > role > role` Enter a role ID.  

Assign guild members a role based on their guild rank when they link their account.  
`guild > rankRoles > enabled: true`  
`guild > rankRoles > roles > rank:` Enter a guild rank name.  
`guild > rankRoles > roles > role` Enter a role ID.  
<br>

### Permissions 
Custom bot permissions:  
- `Owner`: Inherit all perms   
- `Admin`: Inherit all perms except Owner  
- `SetLinkChannel`: Can set linking channel  
- `SetMapChannel`: Can set discord server list channel
- `DeleteMessages`: Can delete messages
- `RestartBot`: Can restart the bot
- `LinkOverride`: Can override the /link database

---

> [!NOTE]
> This project values minimalism.
> Contributors will not recieve any credits on the frontend, except for the credits section within `/help`.

Created by CatboyDark
2024' 07' 11
