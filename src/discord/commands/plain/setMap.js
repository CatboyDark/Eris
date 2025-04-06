import { createMsg, createRow, getPerms } from '../../../utils/utils.js';

export default {
	name: 'setmap',
	prefix: true,

	async execute(message) {
		const perms = getPerms(message.member);
		if (!perms.includes('SetMapChannel')) return;

		const general_1 = createRow([
			{ id: 'SkyblockZ', label: 'SkyblockZ', color: 'Green' },
			{ id: 'SkyblockManiacs', label: 'Skyblock Maniacs', color: 'Green' },
			{ id: 'Cowshed', label: 'Cowshed', color: 'Green' },
			{ id: 'ExoticCafe', label: 'Exotic Cafe', color: 'Green' },
			{ id: 'IronmanSweats', label: 'Ironman Sweats', color: 'Green' }
		]);
		const general_2 = createRow([
			{ id: 'BingoBrewers', label: 'Bingo Brewers', color: 'Green' },
			{ id: 'KuudraGang', label: 'Kuudra Gang', color: 'Green' },
			{ id: 'OfficialHunters', label: 'Official Hunters', color: 'Green' },
			{ id: 'Furfsky', label: 'Furfsky Reborn', color: 'Green' }
		]);
		const skills_1 = createRow([
			{ id: 'MiningCult', label: 'Mining Cult', color: 'Green' },
			{ id: 'HotShirtlessMen', label: 'Hot Shirtless Men', color: 'Green' },
			{ id: 'FarmingCouncil', label: 'Farming Council', color: 'Green' },
			{ id: 'EliteFarmers', label: 'Elite Farmers', color: 'Green' }
		]);
		const mods_1 = createRow([
			{ id: 'Optifine', label: 'Optifine', color: 'Green' },
			{ id: 'Patcher', label: 'Patcher', color: 'Green' },
			{ id: 'SkyClient', label: 'SkyClient', color: 'Green' },
			{ id: 'SkyblockAddons', label: 'SkyblockAddons', color: 'Green' },
			{ id: 'Skytils', label: 'Skytils', color: 'Green' }
		]);
		const mods_2 = createRow([
			{ id: 'NotEnoughUpdates', label: 'NotEnoughUpdates', color: 'Green' },
			{ id: 'ChatTriggers', label: 'ChatTriggers', color: 'Green' },
			{ id: 'SoopyV2', label: 'SoopyV2', color: 'Green' },
			{ id: 'DungeonRoomsMod', label: 'Dungeon Rooms', color: 'Green' },
			{ id: 'Dulkir', label: 'Dulkir', color: 'Green' }
		]);
		const mods_3 = createRow([
			{ id: 'Skyhanni', label: 'Skyhanni', color: 'Green' },
			{ id: 'Odin', label: 'Odin', color: 'Green' },
			{ id: 'Apec', label: 'Apec', color: 'Green' }
		]);

		message.channel.send({ embeds: [createMsg({ desc: '**General**' })],
			components: [
				general_1,
				general_2
			]
		});
		message.channel.send({ embeds: [createMsg({ desc: '**Skills**' })],
			components: [
				skills_1
			]
		});
		message.channel.send({ embeds: [createMsg({ desc: '**Mods**' })],
			components: [
				mods_1,
				mods_2,
				mods_3
			]
		});

		message.delete();
	}
};
