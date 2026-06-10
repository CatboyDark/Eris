const reset = '\x1b[0m'

const colors = {
	red: '#FF0000',
	green: '#00FF00',
	blue: '#0000FF',
	cyan: '#00FFFF',
	magenta: '#FF00FF',
	yellow: '#FFFF00',

	white: '#FFFFFF',
	black: '#000000'
}

const styles = {
	bold: 1,
	dark: 2,
	italic: 3,
	uline: 4,
	strike: 9
}

function toRGB(hex) {
	hex = hex.startsWith('#') ? hex.slice(1) : hex
	const r = parseInt(hex.slice(0, 2), 16)
	const g = parseInt(hex.slice(2, 4), 16)
	const b = parseInt(hex.slice(4, 6), 16)
	return [r, g, b]
}

const codes = () => {
	const codes = {}

	for (const k of Object.keys(colors)) {
		const rgb = toRGB(colors[k])
		codes[k] = rgb
		codes['bg' + k.charAt(0).toUpperCase() + k.slice(1)] = rgb
	}

	for (const k of Object.keys(styles)) {
		codes[k] = styles[k]
	}

	return codes
}

function build(codesMap, applied = []) {
	return new Proxy(
		function (text) {
			const seq = applied.flat().join(';')
			if (typeof text === 'object') text = JSON.stringify(text, null, '\t')
			return `\x1b[${seq}m${text}${reset}`
		},
		{
			get(_, prop) {
				let val = codesMap[prop]
				let isBg = typeof prop === 'string' && prop.startsWith('bg')

				if (!val && typeof prop === 'string') {
					if (prop.startsWith('bg#')) {
						val = toRGB(prop.slice(2))
						isBg = true
					}
					else if (prop.startsWith('#')) {
						val = toRGB(prop)
					}
				}

				if (!val) return undefined

				if (typeof val === 'number') return build(codesMap, applied.concat(val))
				if (Array.isArray(val)) {
					const ansi = isBg ? `48;2;${val.join(';')}` : `38;2;${val.join(';')}`
					return build(codesMap, applied.concat(ansi))
				}
			},
			apply(target, thisArg, args) {
				return target(...args)
			}
		}
	)
}

const color = build(codes())

export {
	color
}