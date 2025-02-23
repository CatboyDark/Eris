function display(str) {
	const validFormats = 'ibusr';
	const validColors = 'ABCDEFabcdef1234567890';

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

			if (i < str.length && str[i] === '+') {
				i++;
				const fgCode = str.substring(i, i + 6);
				if (fgCode.length === 6 && fgCode.split('').every(c => validColors.includes(c))) {
					fg = fgCode;
					i += 6;
				}
			}

			if (i < str.length && str[i] === '-') {
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
				const r = parseInt(fg.substring(0, 2), 16);
				const g = parseInt(fg.substring(2, 4), 16);
				const b = parseInt(fg.substring(4, 6), 16);
				ansi += `\x1b[38;2;${r};${g};${b}m`;
			}

			if (bg) {
				const r = parseInt(bg.substring(0, 2), 16);
				const g = parseInt(bg.substring(2, 4), 16);
				const b = parseInt(bg.substring(4, 6), 16);
				ansi += `\x1b[48;2;${r};${g};${b}m`;
			}

			result += ansi;
		}
		else {
			result += str[i];
			i++;
		}
	}

	result += '\x1b[0m';
	return console.log(result);
}

display.r = function (str) {
	display(`^+FF0000${str}`);
};

display.g = function (str) {
	display(`^+00FF00${str}`);
};

display.b = function (str) {
	display(`^+0000FF${str}`);
};

display.c = function (str) {
	display(`^+00FFFF${str}`);
};

display.m = function (str) {
	display(`^+FF00FF${str}`);
};

display.y = function (str) {
	display(`^+FFFF00${str}`);
};

export default display;

// '\\^' acts as an escape char
