import { MessageFlags } from 'discord.js';
import { createMsg } from '../../helper.js';

const buttonData = [
	// General
	{ id: 'SkyblockZ', url: 'https://discord.gg/skyblock' },
	{ id: 'SkyblockManiacs', url: 'https://discord.gg/aRmgGbU3SA' },
	{ id: 'Cowshed', url: 'https://discord.gg/QCXArXgj7d' },
	{ id: 'ExoticCafe', url: 'https://discord.gg/RTm9gkxhHX' },
	{ id: 'IronmanSweats', url: 'https://discord.gg/UYcuH64JGP' },
	{ id: 'BingoBrewers', url: 'https://discord.gg/5VNFYPqQdV' },
	{ id: 'KuudraGang', url: 'https://discord.gg/98JM7gFU9Q' },
	{ id: 'OfficialHunters', url: 'https://discord.gg/pumpzffDva' },
	{ id: 'Furfsky', url: 'https://discord.gg/RyBeaqajT3' },

	// Skills
	{ id: 'MiningCult', url: 'https://discord.gg/EnEYQw9Gat' },
	{ id: 'HotShirtlessMen', url: 'https://github.com/Rekteiru/Hot-Shirtless-Men' },
	{ id: 'FarmingCouncil', url: 'https://discord.gg/farmers' },
	{ id: 'EliteFarmers', url: 'https://discord.gg/qyex8a7h3Z' },

	// Mods
	{ id: 'Optifine', url: 'https://optifine.net/downloads' },
	{ id: 'Patcher', url: 'https://discord.gg/sk1er' },
	{ id: 'SkyClient', url: 'https://discord.gg/3qw4vzNJNs' },
	{ id: 'SkyblockAddons', url: 'https://discord.gg/zWyr3f5GXz' },
	{ id: 'Skytils', url: 'https://discord.gg/k6C5Jv4ncs' },
	{ id: 'NotEnoughUpdates', url: 'https://discord.gg/moulberry' },
	{ id: 'ChatTriggers', url: 'https://discord.gg/aEehjNVcMN', note: '### Useful Modules: `/ct import`\n- **bettermap**\n - **lividsolver**\n - **dragprio**' },
	{ id: 'SoopyV2', url: 'https://discord.gg/q9Wv6q35th' },
	{ id: 'DungeonRoomsMod', url: 'https://discord.gg/qHx6FPmRY3' },
	{ id: 'Dulkir', url: 'https://discord.gg/CnsM8QXFdJ' },
	{ id: 'Skyhanni', url: 'https://discord.gg/WaYmeTeypy' },
	{ id: 'PartlySaneSkies', url: 'https://discord.gg/V2qeeusd46' },
	{ id: 'Odin', url: 'https://discord.gg/odin-1041616706327552000', note: '### NOTE:\n**There is both a safe and a CHEATER version of this mod.**\n\n-# Use at your own risk!' },
	{ id: 'Apec', url: 'https://discord.gg/92qZHU3K5f' }
];

const buttons = buttonData.reduce((acc, { id, url, note }) => {
	acc[id] = {
		id,
		async execute(interaction) {
			const message = {
				content: url,
				flags: MessageFlags.Ephemeral
			};
			if (note) message.embeds = [createMsg({ desc: note })];
			await interaction.reply(message);
		}
	};
	return acc;
}, {});

export { buttons };
