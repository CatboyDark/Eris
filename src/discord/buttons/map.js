import { MessageFlags } from 'discord.js';
import { createMsg } from '../../helper.js';

const map = {
	// General
	'SkyblockZ': { url: 'https://discord.gg/skyblock'},
	'SkyblockManiacs': { url: 'https://discord.gg/aRmgGbU3SA' },
	'Cowshed': { url: 'https://discord.gg/QCXArXgj7d' },
	'ExoticCafe': { url: 'https://discord.gg/RTm9gkxhHX' },
	'IronmanSweats': { url: 'https://discord.gg/UYcuH64JGP' },
	'BingoBrewers': { url: 'https://discord.gg/5VNFYPqQdV' },
	'KuudraGang': { url: 'https://discord.gg/98JM7gFU9Q' },
	'OfficialHunters': { url: 'https://discord.gg/pumpzffDva' },
	'Furfsky': { url: 'https://discord.gg/RyBeaqajT3' },

	// Skills
	'MiningCult': { url: 'https://discord.gg/EnEYQw9Gat' },
	'HotShirtlessMen': { url: 'https://github.com/Rekteiru/Hot-Shirtless-Men' },
	'FarmingCouncil': { url: 'https://discord.gg/farmers' },
	'EliteFarmers': { url: 'https://discord.gg/qyex8a7h3Z' },

	// Mods
	'Optifine': { url: 'https://optifine.net/downloads' },
	'Patcher': { url: 'https://discord.gg/sk1er' },
	'SkyClient': { url: 'https://discord.gg/3qw4vzNJNs' },
	'SkyblockAddons': { url: 'https://discord.gg/zWyr3f5GXz' },
	'Skytils': { url: 'https://discord.gg/k6C5Jv4ncs' },
	'NotEnoughUpdates': { url: 'https://discord.gg/moulberry' },
	'ChatTriggers': { url: 'https://discord.gg/aEehjNVcMN', note: '### Useful Modules: `/ct import`\n- **bettermap**\n - **lividsolver**\n - **dragprio**' },
	'SoopyV2': { url: 'https://discord.gg/q9Wv6q35th' },
	'DungeonRoomsMod': { url: 'https://discord.gg/qHx6FPmRY3' },
	'Dulkir': { url: 'https://discord.gg/CnsM8QXFdJ' },
	'Skyhanni': { url: 'https://discord.gg/WaYmeTeypy' },
	'PartlySaneSkies': { url: 'https://discord.gg/V2qeeusd46' },
	'Odin': { url: 'https://discord.gg/odin-1041616706327552000', note: '### NOTE:\n**There is both a safe and a CHEATER version of this mod.**\n\n-# Use at your own risk!' },
	'Apec': {url: 'https://discord.gg/92qZHU3K5f' }
};

const buttons = Object.entries(map).map(([name, { url, note }]) => ({
	id: name,

	async execute(interaction) {
		const message = {
			content: url,
			flags: MessageFlags.Ephemeral
		};

		if (note) {
			message.embeds = [createMsg({ desc: note })];
		}

		await interaction.reply(message);
	}
}));

export default buttons;
