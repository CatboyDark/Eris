import { ComponentType, MessageFlags } from 'discord.js';
import { createMsg, createRow, Error } from '../../../utils/utils.js';

class Quiz {
	constructor() {
		this.gameID = Date.now().toString();
		this.players = [];
		this.quizLength = 10;
		this.quizOptions = {
			regions: true,
			types: false,
			evolutions: false,
			gyms: false
		};
		this.questionIndex = 0;
		this.A = '';
		this.points = [];
		this.timer = null;
		this.answerCount = 0;
		this.nextCount = 0;
	}

	async start(interaction) {
		this.players.push({
			user: interaction.user.username,
			nick: interaction.member.nickname ?? interaction.user.username,
			isReady: false,
			isCorrect: null,
			numCorrect: 0,
			points: 0
		});

		interaction.reply({
			embeds: [
				createMsg({
					title: 'Quiz Time!',
					desc: `### Players\n${this.players.length > 0 ? this.players.map(player => `- ${player.nick}`).join('\n') : 'Empty Lobby!'}`,
					image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/250px-International_Pok%C3%A9mon_logo.svg.png'
				})
			],
			components: [
				createRow([
					{ id: 'toggleRegions', label: 'Regions', color: this.quizOptions.regions ? 'Green' : 'Red' }
					// { id: 'toggleTypes', label: 'Types', color: this.quizOptions.types ? 'Green' : 'Red' },
					// { id: 'toggleEvolutions', label: 'Evolutions', color: this.quizOptions.evolutions ? 'Green' : 'Red' }
				]),
				createRow([
					{ id: 'quizLength10', label: '10 Questions', color: this.quizLength === 10 ? 'Green' : 'Red' },
					{ id: 'quizLength15', label: '15 Questions', color: this.quizLength === 15 ? 'Green' : 'Red' },
					{ id: 'quizLength30', label: '30 Questions', color: this.quizLength === 30 ? 'Green' : 'Red' }
					// { id: 'quizLengthInfinite', label: 'INFINITE Questions', color: this.quizLength === -1 ? 'Green' : 'Red' }
				]),
				createRow([
					{ id: 'quizJoin', label: 'Join Game', color: 'Blue' },
					{ id: 'quizStart', label: 'Start', color: 'Blue' }
				])
			]
		});

		await this.interactions(interaction);
	}

	generateLobby(interaction) {
		interaction.update({
			embeds: [
				createMsg({
					title: 'Quiz Time!',
					desc: `### Players\n${this.players.length > 0 ? this.players.map(player => `- ${player.nick}`).join('\n') : 'Empty Lobby!'}`,
					image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/250px-International_Pok%C3%A9mon_logo.svg.png'
				})
			],
			components: [
				createRow([
					{ id: 'toggleRegions', label: 'Regions', color: this.quizOptions.regions ? 'Green' : 'Red' }
					// { id: 'toggleTypes', label: 'Types', color: this.quizOptions.types ? 'Green' : 'Red' },
					// { id: 'toggleEvolutions', label: 'Evolutions', color: this.quizOptions.evolutions ? 'Green' : 'Red' }
				]),
				createRow([
					{ id: 'quizLength10', label: '10 Questions', color: this.quizLength === 10 ? 'Green' : 'Red' },
					{ id: 'quizLength15', label: '15 Questions', color: this.quizLength === 15 ? 'Green' : 'Red' },
					{ id: 'quizLength30', label: '30 Questions', color: this.quizLength === 30 ? 'Green' : 'Red' }
					// { id: 'quizLengthInfinite', label: 'INFINITE Questions', color: this.quizLength === -1 ? 'Green' : 'Red' }
				]),
				createRow([
					{ id: 'quizJoin', label: 'Join Game', color: 'Blue' },
					{ id: 'quizStart', label: 'Start', color: 'Blue' }
				])
			]
		});
	}

	async generateQ(interaction) {
		for (const player of this.players) {
			if (player.waitingMsg) {
				await player.waitingMsg.deleteReply();
				player.waitingMsg = null;
			}
		}
		const options = Object.keys(this.quizOptions).filter(key => this.quizOptions[key]);
		const randomQ = options[Math.floor(Math.random() * options.length)];
		let buttons;
		let poke;
		let Q;

		const regionButtons = createRow([
			{ id: 'regionKanto', label: 'Kanto [I]', color: 'Green' },
			{ id: 'regionJohto', label: 'Johto [II]', color: 'Green' },
			{ id: 'regionHoenn', label: 'Hoenn [III]', color: 'Green' }
		]);
		const regionButtons2 = createRow([
			{ id: 'regionSinnoh', label: 'Sinnoh [IV]', color: 'Green' },
			{ id: 'regionUnova', label: 'Unova [V]', color: 'Green' },
			{ id: 'regionKalos', label: 'Kalos [VI]', color: 'Green' }
		]);
		const regionButtons3 = createRow([
			{ id: 'regionAlola', label: 'Alola [VII]', color: 'Green' },
			{ id: 'regionGalar', label: 'Galar [VIII]', color: 'Green' },
			{ id: 'regionPaladea', label: 'Paladea [IX]', color: 'Green' }
		]);

		if (randomQ === 'regions') {
			buttons = [regionButtons, regionButtons2, regionButtons3];
			poke = await randomPoke();
			Q = `What region is **${format(poke.name)}** from?`;

			this.A = await getRegion(poke.id);
		}
		else if (randomQ === 'types') {
			buttons = [];
		}

		interaction.update({
			embeds: [createMsg({
				title: `Question ${this.questionIndex + 1}`,
				desc: Q,
				image: poke.sprites.other['official-artwork'].front_default
			})],
			components: buttons
		});

		this.timer = Date.now();
	}

	async generateResults(interaction) {
		for (const player of this.players) {
			if (player.waitingMsg) {
				await player.waitingMsg.deleteReply();
				player.waitingMsg = null;
			}
		}
		const currentRankings = this.players.sort((a, b) => {
			if (a.isCorrect === b.isCorrect) {
				return a.time - b.time;
			}
			return b.isCorrect - a.isCorrect;
		});

		const roundPoints = new Map();
		const correctPlayers = currentRankings.filter(player => player.isCorrect);
		const incorrectPlayers = currentRankings.filter(player => !player.isCorrect);

		correctPlayers.forEach((player, i) => {
			const pointsEarned = i === 0 ? 200 : i === 1 ? 150 : 100;
			player.points += pointsEarned;
			roundPoints.set(player.user, pointsEarned);
		});
		incorrectPlayers.forEach(player => {
			player.points += 25;
			roundPoints.set(player.user, 25);
		});

		const results = this.players.map(p =>
			`- **${p.nick}** ${p.isCorrect ? '✅' : '❌'} +${roundPoints.get(p.user)} points (${p.time}s)`
		).join('\n');

		const rankings = currentRankings.map((p, index) =>
			`${index + 1}. **${p.nick}**: ${p.points} points`
		).join('\n');

		interaction.update({
			embeds: [createMsg({
				title: `Question ${this.questionIndex + 1}`,
				desc: `The correct answer was **${this.A}**.\n\n${results}\n### Rankings\n${rankings}`
			})],
			components: [createRow([{ id: 'questionNext', label: 'Next', color: 'Blue' }])]
		});

		this.questionIndex++;
		this.players.forEach(p => p.isCorrect = null);
		this.players.forEach(p => p.isReady = false);
	}

	async generateResultsEnd(interaction) {
		for (const player of this.players) {
			if (player.waitingMsg) {
				await player.waitingMsg.deleteReply();
				player.waitingMsg = null;
			}
		}
		const currentRankings = this.players.sort((a, b) => b.points - a.points);
		const rankings = currentRankings.map((p, i) => `${i + 1}. **${p.nick}**: ${p.points} points (${p.numCorrect}/${this.questionIndex})`).join('\n');

		interaction.update({ embeds: [createMsg({
			desc: `### ${currentRankings[0].nick} wins!   :tada:\n${rankings}`
		})],
		components: []
		});
	}

	async interactions(interaction) {
		const response = await interaction.fetchReply();
		const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000, limit: 1 }); // 1h

		collector.on('collect', async (interaction) => {
			if (interaction.isButton()) {
				const customID = interaction.customId;
				const player = this.players.find(p => p.user === interaction.user.username);

				if (!player && customID !== 'quizJoin') {
					return interaction.reply({ embeds: [createMsg({ desc: '**You\'re not in this game!**' })], flags: MessageFlags.Ephemeral });
				}

				switch (true) {
					case customID.startsWith('toggle'):
						const option = customID.replace('toggle', '').toLowerCase();
						this.quizOptions[option] = !this.quizOptions[option];
						this.generateLobby(interaction);
						break;

					case customID.startsWith('quizLength'):
						this.quizLength = customID === 'quizLengthInfinite' ? -1 : parseInt(customID.replace('quizLength', ''), 10);
						this.generateLobby(interaction);
						break;

					case customID === 'quizJoin':
						if (!this.players.find(player => player.user === interaction.user.username)) {
							this.players.push({
								user: interaction.user.username,
								nick: interaction.member?.nickname || interaction.user.username,
								isReady: false,
								isCorrect: null,
								numCorrect: 0,
								points: 0
							});
						}
						else {
							this.players = this.players.filter(player => player.user !== interaction.user.username);
						}
						this.generateLobby(interaction);
						break;

					case customID === 'quizStart':
						if (interaction.user.id !== interaction.message.interaction.user.id) {
							return interaction.reply({ embeds: [createMsg({ desc: '**Only the host can start the game!**' })], flags: MessageFlags.Ephemeral });
						}
						await this.generateQ(interaction);
						break;

					case customID === 'questionNext':
						if (player.isReady === true) return;
						player.isReady === true;
						this.nextCount++;
						if (this.nextCount === this.players.length) {
							if (this.questionIndex === this.quizLength) {
								await this.generateResultsEnd(interaction);
							}
							else {
								this.nextCount = 0;
								await this.generateQ(interaction);
							}
						}
						else {
							player.waitingMsg = interaction;
							interaction.reply({ embeds: [createMsg({ desc: '**Waiting...**' })], flags: MessageFlags.Ephemeral });
						}
						break;

					case customID.startsWith('region'):
						if (player.isCorrect !== null) {
							return interaction.reply({ embeds: [createMsg({ desc: '**You already submitted an answer!**' })], flags: MessageFlags.Ephemeral });
						}

						player.time = ((Date.now() - this.timer) / 1000).toFixed(1).replace(/\.0$/, '');

						const a = customID.replace('region', '').trim();
						const correctA = this.A.split(' ')[0].trim();
						player.isCorrect = a === correctA;
						if (player.isCorrect) {
							player.numCorrect++;
						}
						this.answerCount++;

						if (this.answerCount === this.players.length) {
							this.answerCount = 0;
							await this.generateResults(interaction);
						}
						else {
							player.waitingMsg = interaction;
							interaction.reply({ embeds: [createMsg({ desc: `**You selected ${a}!**` })], flags: MessageFlags.Ephemeral, withResponse: true });
						}
						break;
				}
			}
		});
	}
}

async function randomPoke() {
	try {
		const randomID = Math.floor(Math.random() * 1025) + 1;
		const getPoke = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomID}`);
		return await getPoke.json();
	}
	catch (e) {
		await Error('! randomPoke !', e);
	}
}

function format(poke) {
	return poke.split(/(\W+)/).map((word, index) => {
		if (index % 2 === 0) {
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		}
		return word;
	})
	.join('');
}

async function getRegion(pokeID) {
	const genMap = [
		{ generation: 'generation-i', region: 'Kanto', tag: '[I]' },
		{ generation: 'generation-ii', region: 'Johto', tag: '[II]' },
		{ generation: 'generation-iii', region: 'Hoenn', tag: '[III]' },
		{ generation: 'generation-iv', region: 'Sinnoh', tag: '[IV]' },
		{ generation: 'generation-v', region: 'Unova', tag: '[V]' },
		{ generation: 'generation-vi', region: 'Kalos', tag: '[VI]' },
		{ generation: 'generation-vii', region: 'Alola', tag: '[VII]' },
		{ generation: 'generation-viii', region: 'Galar', tag: '[VIII]' },
		{ generation: 'generation-ix', region: 'Paladea', tag: '[IX]' }
	];

	try {
		const getPoke = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeID}`);
		const poke = await getPoke.json();

		const getSpecies = await fetch(poke.species.url);
		const species = await getSpecies.json();

		const generation = species.generation.name;
		const region = genMap.find(item => item.generation === generation);

		return region ? `${region.region} ${region.tag}` : 'Unknown';
	}
	catch (e) {
		console.error(e);
	}
}

export default {
	name: 'poke',
	desc: 'Test your Pokemon knowledge!',

	async execute(interaction) {
		const quiz = new Quiz();
		await quiz.start(interaction);
	}
};
