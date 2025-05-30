import { createMsg, createRow, createForm } from '../../../helper/builder.js';
import { readConfig, getGuild, toggleConfig, writeConfig } from '../../../helper/utils';

async function getGuildRanks() {
	const config = readConfig();
	const guild = await getGuild('guild', config.guild);

	const guildRanks = guild.ranks.map((rank) => rank.name);
	return guildRanks;
}

async function createGuildRankRolesMsg() {
	const guildRanks = await getGuildRanks();
	const config = readConfig();

	const roles = guildRanks
		.map((rank, index) => {
			const rankNum = index + 1;
			const roleKey = `guildRank${rankNum}Role`;

			if (config.guildRankRoles[roleKey]) {
				return `${rankNum}. ${rank} - <@&${config.guildRankRoles[roleKey]}>`;
			}
			return `${rankNum}. ${rank}`;
		}).join('\n');

	return createMsg({
		title: 'Custom Roles: Guild Ranks',
		desc: `Assign roles based on the user's rank in your guild.\n### Guild Ranks:\n${roles}`
	});
}

async function createButtons() {
	const guildRanks = await getGuildRanks();
	const config = readConfig();

	const buttons = guildRanks.map((rank, index) => {
		const id = `guildRank${index + 1}`;
		const style = config.features[`guildRank${index + 1}Toggle`]
			? 'Green'
			: 'Red';

		return { id, label: rank, style };
	});

	return createRow(buttons);
}

function back() {
	const config = readConfig();
	const buttons = createRow([
		{ id: 'customRoles', label: 'Back', style: 'Gray' },
		{
			id: 'guildRankRolesToggle',
			label: 'Enable Guild Rank Roles',
			style: config.features.guildRankRolesToggle
		}
	]);

	return buttons;
}

async function guildRankRoles(interaction) {
	await interaction.update({
		embeds: [await createGuildRankRolesMsg()],
		components: [await createButtons(), back()]
	});
}

async function guildRanksToggle(interaction) {
	const config = readConfig();
	const rankNum = interaction.customId;
	const guildRanks = await getGuildRanks();
	const rankName = guildRanks[rankNum.replace('guildRank', '') - 1];
	const toggleKey = `${rankNum}Toggle`;
	const roleKey = `${rankNum}Role`;

	if (interaction.isButton() && !config.features[toggleKey]) {
		const modal = createForm({
			id: rankNum,
			title: `Set ${rankName}`,
			components: [
				{
					id: `${rankNum}Input`,
					label: `ENTER ROLE ID FOR ${rankName}:`,
					style: 'short',
					required: true
				}
			]
		});

		await interaction.showModal(modal);
		return;
	}

	if (interaction.isModalSubmit()) {
		const input = interaction.fields.getTextInputValue(`${rankNum}Input`);
		const role = interaction.guild.roles.cache.get(input);
		if (!role) {
			return interaction.reply({
				embeds: [createMsg({ color: 'Red', desc: '**That\'s not a valid Role ID!**' })],
				ephemeral: true
			});
		}

		config.guildRankRoles[roleKey] = input;
		writeConfig(config);
		toggleConfig(`features.${toggleKey}`);
		await guildRankRoles(interaction);
		return;
	}

	if (config.features[toggleKey]) {
		toggleConfig(`features.${toggleKey}`);
		await guildRankRoles(interaction);
	}
}

async function guildRankRolesToggle(interaction) {
	toggleConfig('features.guildRankRolesToggle');
	await guildRankRoles(interaction);
}

export default 
{
	guildRankRoles,
	guildRanksToggle,
	guildRankRolesToggle
};
