import { Team } from 'discord.js';
import { discord } from '../../discord/Discord.js';
import { config, DCsend } from '../utils.js';

const colors = {
	red:    'FF0000',
	green:  '00FF00',
	blue:   '0000FF',
	cyan:   '00FFFF',
	magenta:'FF00FF',
	yellow: 'FFFF00'
};

(function extendConsole() {
	const validFormats = 'ibusr';
	const validColors = 'ABCDEFabcdef1234567890';

	function display(str) {
		if (typeof str !== 'string') {
			console.red('Console > Invalid string.');
			return;
		}

		let result = '';
		let i = 0;

		while (i < str.length) {
			if (str[i] === '\\' && str[i + 1] === '^') {
				result += '^';
				i += 2;
				continue;
			}

			if (str[i] === '^') {
				let code = '';
				i++;

				while (i < str.length && validFormats.includes(str[i])) {
					code += str[i++];
				}

				let fg = null, bg = null;

				if (str[i] === '+') {
					i++;
					const fgCode = str.substring(i, i + 6);
					if (fgCode.length === 6 && fgCode.split('').every(c => validColors.includes(c))) {
						fg = fgCode;
						i += 6;
					}
				}

				if (str[i] === '-') {
					i++;
					const bgCode = str.substring(i, i + 6);
					if (bgCode.length === 6 && bgCode.split('').every(c => validColors.includes(c))) {
						bg = bgCode;
						i += 6;
					}
				}

				if (!code && !fg && !bg) {
					result += '^';
					continue;
				}

				let ansi = '';

				if (code.includes('r')) ansi += '\x1b[0m';
				if (code.includes('b')) ansi += '\x1b[1m';
				if (code.includes('i')) ansi += '\x1b[3m';
				if (code.includes('u')) ansi += '\x1b[4m';
				if (code.includes('s')) ansi += '\x1b[9m';

				if (fg) {
					const r = parseInt(fg.slice(0, 2), 16);
					const g = parseInt(fg.slice(2, 4), 16);
					const b = parseInt(fg.slice(4, 6), 16);
					ansi += `\x1b[38;2;${r};${g};${b}m`;
				}

				if (bg) {
					const r = parseInt(bg.slice(0, 2), 16);
					const g = parseInt(bg.slice(2, 4), 16);
					const b = parseInt(bg.slice(4, 6), 16);
					ansi += `\x1b[48;2;${r};${g};${b}m`;
				}

				result += ansi;
			}
			else {
				result += str[i++];
			}
		}

		result += '\x1b[0m';
		return console.log(result);
	}

	for (const [method, hex] of Object.entries(colors)) {
		console[method] = function (text, error) {
			display(`^+${hex}${text}`);
			if (error) console.log(error);
		};
	}

	console.display = display;

	console.error = async function (name, error) {
		console.red(name);
		console.log(error);

		const app = await discord.application.fetch();

		DCsend(config.logs.bot.channelID, [
			{ desc: `<@${app.owner instanceof Team ? app.owner.ownerId : app.owner.id}>` },
			{
				color: 'Red',
				embed: [{ desc:
					'### A Silly has occured!\n' +
					`\`\`\`${typeof error === 'string' ? error : error.message}\`\`\`\n` +
					'-# If you believe this is a bug, please contact @catboydark.'
				}],
				timestamp: 'f'
			}
		]);
	};
})();
