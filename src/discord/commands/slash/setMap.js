import { createMsg, DCsend } from '../../../utils/utils.js';

const message = [
	{
		embed: [
			{
				desc: '### General'
			},
			[
				{ id: 'SkyblockZ', label: 'SkyblockZ', color: 'Green' },
				{ id: 'SkyblockManiacs', label: 'Skyblock Maniacs', color: 'Green' },
				{ id: 'Cowshed', label: 'Cowshed', color: 'Green' },
				{ id: 'ExoticCafe', label: 'Exotic Cafe', color: 'Green' },
				{ id: 'IronmanSweats', label: 'Ironman Sweats', color: 'Green' }
			],
			[
				{ id: 'BingoBrewers', label: 'Bingo Brewers', color: 'Green' },
				{ id: 'KuudraGang', label: 'Kuudra Gang', color: 'Green' },
				{ id: 'OfficialHunters', label: 'Official Hunters', color: 'Green' },
				{ id: 'Furfsky', label: 'Furfsky Reborn', color: 'Green' }
			]
		]
	},
	{
		embed: [
			{
				desc: '### Skills'
			},
			[
				{ id: 'MiningCult', label: 'Mining Cult', color: 'Green' },
				{ id: 'HotShirtlessMen', label: 'Hot Shirtless Men', color: 'Green' },
				{ id: 'FarmingCouncil', label: 'Farming Council', color: 'Green' },
				{ id: 'EliteFarmers', label: 'Elite Farmers', color: 'Green' }
			]
		]
	},
	{
		embed: [
			{
				desc: '### Mods'
			},
			[
				{ id: 'Optifine', label: 'Optifine', color: 'Green' },
				{ id: 'Patcher', label: 'Patcher', color: 'Green' },
				{ id: 'SkyClient', label: 'SkyClient', color: 'Green' },
				{ id: 'SkyblockAddons', label: 'SkyblockAddons', color: 'Green' },
				{ id: 'Skytils', label: 'Skytils', color: 'Green' }
			],
			[
				{ id: 'NotEnoughUpdates', label: 'NotEnoughUpdates', color: 'Green' },
				{ id: 'ChatTriggers', label: 'ChatTriggers', color: 'Green' },
				{ id: 'SoopyV2', label: 'SoopyV2', color: 'Green' },
				{ id: 'DungeonRoomsMod', label: 'Dungeon Rooms', color: 'Green' },
				{ id: 'Dulkir', label: 'Dulkir', color: 'Green' }
			],
			[
				{ id: 'Skyhanni', label: 'Skyhanni', color: 'Green' },
				{ id: 'Odin', label: 'Odin', color: 'Green' },
				{ id: 'Apec', label: 'Apec', color: 'Green' }
			]
		]
	}
];

export default {
	name: 'setmap',
	desc: 'Setup resource map channel',
	options: [
		{ type: 'channel', name: 'channel', desc: 'Enter a channel' }
	],
	permissions: 0,

	async execute(interaction) {
		const channel = interaction.options.getChannel('channel') ?? interaction.channel;

		DCsend(channel, message);

		interaction.reply(createMsg([{ embed: [{ desc: `**Resource map channel has been set to <#${channel.id}>**` }] }], { ephemeral: true }));
	}
};
