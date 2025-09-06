import { ComponentType } from 'discord.js';
import { createMsg, getMember } from '../../../utils/utils.js';

class RPS {
	constructor() {
		this.challenger = { id: null, name: null, choice: null, score: 0 };
		this.opponent = { id: null, name: null, choice: null, score: 0 };
		this.round = 1;
		this.gameMessage = null;
		this.tempMessages = {};
	}

	async start(interaction) {
		const user = await interaction.options.getUser('user');
		const opponent = await getMember(user.id);

		this.challenger.id = interaction.member.id;
		this.challenger.name = interaction.member.displayName;
		this.opponent.id = opponent.id;
		this.opponent.name = opponent.displayName;

		this.gameMessage = await interaction.reply(createMsg([
			{ embed: [{ desc: `### Rock Paper Scissors\n<@${interaction.member.id}> challenged <@${opponent.id}> to Rock Paper Scissors!` }]},
			[{ id: 'rps_accept', label: 'Accept', color: 'Green' }]
		]));
		await this.interactions(interaction);
	}

	async beginRound(interaction) {
		const message = createMsg([
			{ embed: [{ desc:
				`### Round ${this.round}\n` +
				'**Current Score**\n' +
				`${this.challenger.name}: ${this.challenger.score}\n` +
				`${this.opponent.name}: ${this.opponent.score}\n`
			}] },
			[
				{ id: 'rps_Rock', label: '🪨 Rock', color: 'Blue' },
				{ id: 'rps_Paper', label: '📄 Paper', color: 'Green' },
				{ id: 'rps_Scissors', label: '✂️ Scissors', color: 'Red' }
			]
		]);

		if (interaction.type === 3) {
			await interaction.update(message);
		}
		else {
			await interaction.edit(message);
		}
	}

	async endRound() {
		const result = logic(this.challenger.choice, this.opponent.choice);
		result === 1? this.challenger.score += 1 : result === -1 ? this.opponent.score += 1 : null;

		await this.gameMessage.edit(createMsg([{ embed: [{ desc:
			`### Round ${this.round}\n` +
			`${this.challenger.name} picked ${emojis[this.challenger.choice]} **${this.challenger.choice}**!\n` +
			`${this.opponent.name} picked ${emojis[this.opponent.choice]} **${this.opponent.choice}**!\n\n` +
			`${result === 0 ? '**It\'s a tie!**' : result === 1 ? `**${this.challenger.name} wins!**` : `**${this.opponent.name} wins!**`}`
		}]}]));

		this.challenger.choice = null;
		this.opponent.choice = null;
		this.round += 1;

		setTimeout(async () => {
			for (const id of [this.challenger.id, this.opponent.id]) {
				const reply = this.tempMessages[id];
				if (reply) await reply.delete();
			}

			await this.beginRound(this.gameMessage);
		}, 3000);
	}

	async interactions(interaction) {
		const response = await interaction.fetchReply();
		const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });

		collector.on('collect', async (interaction) => {
			if (!interaction.isButton()) return;
			if (![this.challenger.id, this.opponent.id].includes(interaction.member.id)) return interaction.reply(createMsg([{ embed: [{ desc: '**You\'re not a part of this game!**' }] }], { ephemeral: true }));

			const customID = interaction.customId;

			switch (true) {
				case customID === 'rps_accept':
					if (interaction.member.id !== this.opponent.id) return interaction.reply(createMsg([{ embed: [{ desc: '**You can\'t accept your own challenge!**' }] }], { ephemeral: true }));

					await this.beginRound(interaction);
					break;

				case ['rps_Rock', 'rps_Paper', 'rps_Scissors'].includes(customID):
					const move = customID.replace('rps_', '');

					if (interaction.member.id === this.challenger.id) {
						this.challenger.choice = move;
						this.tempMessages[interaction.member.id] = await interaction.reply(createMsg([{ embed: [{ desc: `**You picked ${emojis[this.challenger.choice]} ${move}!**` }] }], { ephemeral: true }));
					}
					else if (interaction.member.id === this.opponent.id) {
						this.opponent.choice = move;
						this.tempMessages[interaction.member.id] = await interaction.reply(createMsg([{ embed: [{ desc: `You picked **${emojis[this.challenger.choice]} ${move}**!` }] }], { ephemeral: true }));
					}
					else {
						return interaction.reply(createMsg([{ embed: [{ desc: '**You\'re not a part of this game!**' }] }], { ephemeral: true }));
					}

					if (this.challenger.choice && this.opponent.choice) {
						setTimeout(async () => {
							await this.endRound();
						}, 1000);
					}
					break;
			}

		});
	}
}

function logic(a, b) {
	if (a === b) return 0;
	if (a === 'Rock' && b === 'Scissors') return 1;
	if (a === 'Rock' && b === 'Paper') return -1;
	if (a === 'Paper' && b === 'Rock') return 1;
	if (a === 'Paper' && b === 'Scissors') return -1;
	if (a === 'Scissors' && b === 'Paper') return 1;
	if (a === 'Scissors' && b === 'Rock') return -1;
	return null;
}

const emojis = {
	Rock: '🪨',
	Paper: '📄',
	Scissors: '✂️'
};

export default {
	name: 'rps',
	desc: 'Rock Paper Scissors!',
	options: [
		{ type: 'user', name: 'user', desc: 'Choose your opponent', required: true }
	],

	async execute(interaction) {
		const game = new RPS();
		await game.start(interaction);
	}
};
