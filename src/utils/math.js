const suffices = {
	'k': 1e3,          // Thousand
	'M': 1e6,          // Million
	'B': 1e9,          // Billion
	'T': 1e12,         // Trillion
	'Qa': 1e15,        // Quadrillion
	'Qi': 1e18,        // Quintillion
	'Sx': 1e21,        // Sextillion
	'Sp': 1e24,        // Septillion
	'Oc': 1e27,        // Octillion
	'No': 1e30,        // Nonillion

	// 10s: Decillions (De)
	'De': 1e33,        // Decillion
	'UnD': 1e36,       // Undecillion
	'DuD': 1e39,       // Duodecillion
	'TeD': 1e42,       // Tredecillion
	'QaD': 1e45,       // Quattuordecillion
	'QiD': 1e48,       // Quindecillion
	'SxD': 1e51,       // Sedecillion
	'SpD': 1e54,       // Septendecillion
	'OcD': 1e57,       // Octodecillion
	'NoD': 1e60,       // Novemdecillion

	// 20s: Vigintillions (Vg)
	'Vg': 1e63,        // Vigintillion
	'UnV': 1e66,       // Unvigintillion
	'DuV': 1e69,       // Duovigintillion
	'TeV': 1e72,       // Tresvigintillion
	'QaV': 1e75,       // Quattuorvigintillion
	'QiV': 1e78,       // Quinvigintillion
	'SxV': 1e81,       // Sexvigintillion
	'SpV': 1e84,       // Septenvigintillion
	'OcV': 1e87,       // Octovigintillion
	'NoV': 1e90,       // Novemvigintillion

	// 30s: Trigintillions (Tg)
	'Tg': 1e93,        // Trigintillion
	'UnTg': 1e96,      // Untrigintillion
	'DuTg': 1e99,      // Duotrigintillion
	'TeTg': 1e102,     // Trestrigintillion
	'QaTg': 1e105,     // Quattuortrigintillion
	'QiTg': 1e108,     // Quintrigintillion
	'SxFg': 1e111,     // Sextrigintillion
	'SpTg': 1e114,     // Septentrigintillion
	'OcTg': 1e117,     // Octotrigintillion
	'NoTg': 1e120,     // Novemtrigintillion

	// 40s: Quadragintillions (QdG)
	'QdG': 1e123,      // Quadragintillion
	'UnQdG': 1e126,    // Unquadragintillion
	'DuQdG': 1e129,    // Duoquadragintillion
	'TeQdG': 1e132,    // Trequadragintillion
	'QaQdG': 1e135,    // Quattuorquadragintillion
	'QiQdG': 1e138,    // Quinquadragintillion
	'SxQdG': 1e141,    // Sexquadragintillion
	'SpQdG': 1e144,    // Septenquadragintillion
	'OcQdG': 1e147,    // Octoquadragintillion
	'NoQdG': 1e150,    // Novemquadragintillion

	// 50s: Quinquagintillions (QnG)
	'QnG': 1e153,      // Quinquagintillion
	'UnQnG': 1e156,    // Unquinquagintillion
	'DuQnG': 1e159,    // Duoquinquagintillion
	'TeQnG': 1e162,    // Trequinquagintillion
	'QaQnG': 1e165,    // Quattuorquinquagintillion
	'QiQnG': 1e168,    // Quinquinquagintillion
	'SxQnG': 1e171,    // Sexquinquagintillion
	'SpQnG': 1e174,    // Septenquinquagintillion
	'OcQnG': 1e177,    // Octoquinquagintillion
	'NoQnG': 1e180,    // Novemquinquagintillion

	// 60s: Sexagintillions (SxG)
	'SxG': 1e183,      // Sexagintillion
	'UnSxG': 1e186,    // Unsexagintillion
	'DuSxG': 1e189,    // Duosexagintillion
	'TeSxG': 1e192,    // Tresexagintillion
	'QaSxG': 1e195,    // Quattuorsexagintillion
	'QiSxG': 1e198,    // Quinsexagintillion
	'SxSxG': 1e201,    // Sexsexagintillion
	'SpSxG': 1e204,    // Septensexagintillion
	'OcSxG': 1e207,    // Octosexagintillion
	'NoSxG': 1e210,    // Novemsexagintillion

	// 70s: Septuagintillions (SpG)
	'SpG': 1e213,      // Septuagintillion
	'UnSpG': 1e216,    // Unseptuagintillion
	'DuSpG': 1e219,    // Duoseptuagintillion
	'TeSpG': 1e222,    // Treseptuagintillion
	'QaSpG': 1e225,    // Quattuorseptuagintillion
	'QiSpG': 1e228,    // Quinseptuagintillion
	'SxSpG': 1e231,    // Sexseptuagintillion
	'SpSpG': 1e234,    // Septenseptuagintillion
	'OcSpG': 1e237,    // Octoseptuagintillion
	'NoSpG': 1e240,    // Novemseptuagintillion

	// 80s: Octogintillions (OcG)
	'OcG': 1e243,      // Octogintillion
	'UnOcG': 1e246,    // Unoctogintillion
	'DuOcG': 1e249,    // Duooctogintillion
	'TeOcG': 1e252,    // Treoctogintillion
	'QaOcG': 1e255,    // Quattuoroctogintillion
	'QiOcG': 1e258,    // Quinoctogintillion
	'SxOcG': 1e261,    // Sexoctogintillion
	'SpOcG': 1e264,    // Septenoctogintillion
	'OcOcG': 1e267,    // Octooctogintillion
	'NoOcG': 1e270,    // Novemoctogintillion

	// 90s: Nonagintillions (NoG)
	'NoG': 1e273,      // Nonagintillion
	'UnNoG': 1e276,    // Unnonagintillion
	'DuNoG': 1e279,    // Duononagintillion
	'TeNoG': 1e282,    // Trenonagintillion
	'QaNoG': 1e285,    // Quattuornonagintillion
	'QiNoG': 1e288,    // Quinnonagintillion
	'SxNoG': 1e291,    // Sexnonagintillion
	'SpNoG': 1e294,    // Septennonagintillion
	'OcNoG': 1e297,    // Octononagintillion
	'NoNoG': 1e300,    // Novemnonagintillion

	// 100: The Big Cent
	'Ce': 1e303        // Centillion
}

const rounding = {
	'true': 'round',
	'up': 'ceil',
	'down': 'floor'
}

if (!Number.prototype.parse) {
	Object.defineProperty(Number.prototype, 'parse', {
		value: function ({ decimals = 0, round = true, short = '' } = {}) {
			const num = this.valueOf()
			const chosenMethod = rounding[round] || 'round'
			const suffixMultiplier = suffices[short] || 1
			const adjustedNumber = num / suffixMultiplier
			const decimalMultiplier = Math.pow(10, decimals)

			return Math[chosenMethod](adjustedNumber * decimalMultiplier) / decimalMultiplier
		},
		writable: false,
		configurable: false,
		enumerable: false
	})
}
else {
	console.log('THE WORLD IS ENDING!!!')
	console.log('Kidding. But something is hijacking Number.parse. Mission abort!')
	process.exit(1)
}

Object.freeze(Number.prototype)