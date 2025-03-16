import { getCata, getPlayer } from '../../helper.js';

export default {
	name: 'f0',
	prefix: true,
	channel: ['guild', 'officer', 'party', 'dm'],
	options: ['ign'],

	async execute(message) {
		let player;

		if (!message.options.ign) {
			player = await getPlayer(message.sender);
		}
		else {
			player = await getPlayer(message.options.ign).catch((e) => {
				if (e.message.includes('Player does not exist.')) return message.reply('Invalid IGN!');
				if (e.message.includes('Player has never logged into Hypixel.')) return message.reply(`${message.options.ign} doesn't play Hypixel!`);
			});
		}

		if (!player) return;

		const cata = await getCata.current(player).catch((e) => {
			if (e.message.includes('The player has no skyblock profiles.')) return message.reply(`${player.nickname} doesn't play Skyblock!`);
			console.log(e);
		});

		if (!cata) return;

		const runs = cata.completions.catacombs.Floor_0;

		const pb = getPB(cata, 'entrance');
		if (!pb) {
			return message.reply(`${player.nickname} hasn't played Entrance!`);
		}

		await message.reply(`${player.nickname}'s Entrance: ${runs} Runs | PB: ${pb.score} ${pb.time}`);
	}
};

export { getPB };

function getPB(cata, floor) {
	const floorData = cata.floors[floor];

	const runs = [
        floorData.fastestSPlusRun,
        floorData.fastestRun,
        floorData.fastestSRun
    ];

	const validRuns = runs.filter(run => run);
	if (validRuns.length === 0) return null;

	function calculateScore(run) {
        return run.score_exploration + run.score_speed + run.score_skill + run.score_bonus;
    }

	let highestRun = validRuns[0];
    let highestScore = calculateScore(highestRun);

    for (const run of validRuns) {
        const currentScore = calculateScore(run);
        if (currentScore > highestScore) {
            highestScore = currentScore;
            highestRun = run;
        }
    };

	let rank;
	if (highestScore >= 300) {
        rank = 'S+';
    }
	if (highestScore >= 269.5 && highestScore <= 299) {
        rank = 'S';
    }
    if (highestScore >= 230 && highestScore <= 269.4) {
        rank = 'A';
    }
	else if (highestScore >= 160 && highestScore < 230) {
        rank = 'B';
    }
	else if (highestScore >= 100 && highestScore < 160) {
        rank = 'C';
    }
	else if (highestScore >= 0 && highestScore < 100) {
        rank = 'D';
    }

	const totalSeconds = Math.floor(highestRun.elapsed_time / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	const secondsF = seconds < 10 ? `0${seconds}` : seconds;

	return {
		score: rank,
		time: `${minutes}:${secondsF}`
	};
}
