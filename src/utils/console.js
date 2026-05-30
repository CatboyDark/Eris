import { color, config } from '#utils'

console.info = function (message) {
	console.log(color.black.bgCyan.bold(' \u2139 ') + ' ' + color.cyan(message))
}

console.warn = function (message, desc = null) {
	console.log(color.black.bgYellow.bold(' ? ') + ' ' + color.yellow(message))
	if (desc) console.log(desc)
}

console.error = function (message, desc = null) {
	console.log(color.black.bgRed.bold(' ✘ ') + ' ' + color.red(message))
	if (desc) console.log(desc)
}

console.debug = function (message) {
	if (!config.debug) return
	console.log(color.black.bgGreen.bold(' ~ ') + ' ' + color.green(message))
}