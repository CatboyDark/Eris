import { color, config } from '#utils'


if (
	console.info.toString().includes('[native code]') &&
	console.warn.toString().includes('[native code]') &&
	console.error.toString().includes('[native code]') &&
	console.debug.toString().includes('[native code]')
) {
	Object.defineProperties(console, {
		info: {
			value: function (message) {
				console.log(color.black.bgCyan.bold(' \u2139 ') + ' ' + color.cyan(message))
			},
			writable: false, configurable: false, enumerable: true
		},
		warn: {
			value: function (message, description = null) {
				console.log(color.black.bgYellow.bold(' ? ') + ' ' + color.yellow(message))
				if (description) console.log(description)
			},
			writable: false, configurable: false, enumerable: true
		},
		error: {
			value: function (message, description = null) {
				console.log(color.black.bgRed.bold(' ✘ ') + ' ' + color.red(message))
				if (description) console.log(description)
			},
			writable: false, configurable: false, enumerable: true
		},
		debug: {
			value: function (message) {
				if (!config.debug) return
				console.log(color.black.bgGreen.bold(' ~ ') + ' ' + color.green(message))
			},
			writable: false, configurable: false, enumerable: true
		}
	})
}
else {
	console.log('THE WORLD IS ENDING!!!')
	console.log('Kidding. But something is hijacking the global console object. Mission abort!')
	process.exit(1)
}