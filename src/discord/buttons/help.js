import { mcCommands, mcCommandsReady } from '../../minecraft/Minecraft.js';
import { config, createMsg } from '../../utils/utils.js';

const buttons =	[
	{ id: 'DCcmds', label: 'Discord Commands', color: 'Green' },
	{ id: 'MCcmds', label: 'Minecraft Commands', color: 'Green' },
	{ id: 'support', label: 'Support', color: 'Blue' },
	{ label: 'Source', url: 'https://github.com/CatboyDark/Eris' }
];

const mcCommandInfo = {
	'discord': { title: 'Discord', aliases: ['discord', 'd'], example: '@derailious' },
	'guild': { title: 'Guild', aliases: ['guild', 'g'], example: 'Derailious: Creators Club | Weekly GXP: 211k' },
	'guildextras': { title: 'Guild Extras', aliases: ['guildextras', 'ge'], example: 'Derailious: Creators Club | Weekly GXP: 211k\nCreators Club: Level 199.3 | GM: F8_DarQ | Members: 125 | Weekly GXP: 9M' },
	'guildinfo': { title: 'Guild Info', aliases: ['guildinfo', 'gi'], example: 'Creators Club: Level 199.3 | GM: F8_DarQ | Members: 125 | Weekly GXP: 9M' },
	'namehistory': { title: 'Name History', aliases: ['namehistory', 'nh'], example: 'Derailious\'s aliases: Lolman1940' },
	'level': { title: 'Level', aliases: ['level', 'l', 'lv'], example: 'Derailious: Level 456 (36/100)' },
	'networth': { title: 'Networth', aliases: ['networth', 'nw'], example: 'Derailious\'s Networth: 36.8B | Purse: 662k | Bank: 1.7B' },
	'skills': { title: 'Skills', aliases: ['skills', 'skill'], example: 'Derailious: Comb 60 | Farm 57 | Fish 50 | Mine 60 | Fora 54 | Ench 60 | Alch 50 | Tame 60 | Carp 50 | Skill Avg 50.1' },
	'catacombs': { title: 'Cata', aliases: ['catacombs', 'cata'], example: 'Derailious: Cata 40 | ➶34 ⚡36 ☄36 ⚓33 ⚚34 Class Avg 34.9 | Secrets: 6k (7.2 S/R)' },
	'.f0': { title: 'Catacombs Floors', example: 'Derailious\'s M7: Runs: 36 | Total Collection: 423 | PB: S+ 6:42' },
	'slayers': { title: 'Slayers', aliases: ['slayers', 'slayer'], example: 'Derailious: Zombie 7 | Spider 6 | Wolf 5 | Enderman 4 | Blaze 3 | Vampire 2' },
	'zombie': { title: 'Zombies', aliases: ['zombie', 'zombies', 'revenant', 'revenants', 'rev', 'revs'], example: 'Derailious: Zombie 9 (1M) | T1: 40 | T2: 9 | T3: 10 | T4: 210 | T5: 676' },
	'spider': { title: 'Spiders', aliases: ['spider', 'spiders', 'tarantula', 'tarantulas', 'taran', 'tarans', 'tara', 'taras'], example: 'Derailious: Spider 9 (3M) | T1: 71 | T2: 13 | T3: 7 | T4: 1908 | T5: 1683' },
	'wolf': { title: 'Wolves', aliases: ['wolf', 'wolves', 'sven', 'svens'], example: 'Derailious: Wolf 8 (502k) | T1: 2 | T2: 4 | T3: 14 | T4: 879' },
	'ender': { title: 'Enders', aliases: ['ender', 'enders', 'endermen', 'enderman', 'voidgloom', 'voidglooms'], example: 'Derailious: Ender 8 (568k) | T1: 28 | T2: 75 | T3: 38 | T4: 1058' },
	'blaze': { title: 'Blazes', aliases: ['blaze', 'blazes', 'inferno', 'infernos'], example: 'Derailious: Blaze 9 (1M) | T1: 33 | T2: 52 | T3: 76 | T4: 3005' },
	'vampire': { title: 'Vampires', aliases: ['vampire', 'vampires', 'vamp', 'vamps', 'riftstalker', 'riftstalkers'], example: 'Derailious: Vampire 5 (10k) | T1: 4 | T2: 2 | T3: 1 | T4: 86 | T5: 1' }
};

export let helpMCcommands;
mcCommandsReady.then(() => {
	helpMCcommands = genMCinfo();
});

function genMCinfo() {
	let desc = `### Minecraft Commands\nCommands take IGN and Profile (if applicable) as arguments.\nExample: \`${config.prefix}level CatboyDark Banana\`\n\n`;

	if (!mcCommands) return desc = '### No Minecraft commands loaded!';

	for (const key in mcCommandInfo) {
		const mapKey = key.startsWith(config.prefix) ? key : `${config.prefix}${key}`;

		if (!mcCommands.has(mapKey)) continue;

		const cmd = mcCommandInfo[key];
		const mcCmd = mcCommands.get(mapKey);

		const prefix = (mcCmd && mcCmd.prefix) ? config.prefix : '';
		const aliases = (cmd.aliases || []).map(a => `\`${prefix}${a}\``).join(' ');

		if (key === '.f0') {
			desc += `**${cmd.title}**\n\`.f0\` - \`.m7\`\n\n`;
		}
		else if (key === 'guildinfo') {
			desc += `**${cmd.title}**\n\`${prefix}guildinfo\` \`${prefix}gi\`\nTakes guild name as an argument.\nFor names with spaces, use quotes: \`${prefix}guildinfo 'Creators Club'\`\n\n`;
		}
		else {
			desc += `**${cmd.title}**\n${aliases}\n\n`;
		}
	}

	const message = createMsg([
				{
					embed: [{
						desc
					}]
				},
				buttons
	]);

	return message;
}

const helpSupportPage = createMsg([
	{
		embed: [{ desc:
			'### Support\n' +
			'For bot support, suggestions, or bug reports, please contact @catboydark ❤'
		}]
	},
	buttons
]);

export default [
	{
		id: 'DCcmds',

		async execute(interaction) {
			interaction.update(createMsg([
				{
					embed: [{
						desc: '### Discord Commands\n'
					}]
				},
				buttons
			]));
		}
	},
	{
		id: 'MCcmds',

		async execute(interaction) {
			interaction.update(helpMCcommands);
		}
	},
	{
		id: 'support',

		async execute(interaction) {
			interaction.update(helpSupportPage);
		}
	}
];

