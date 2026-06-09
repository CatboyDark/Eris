import { AuthMissingError, ConfigMissingError, UnknownError } from '#utils'
import fs from 'fs'
import path from 'path'
import { parse as parseJSONC } from 'jsonc-parser'

function read(file) {
	let data = {}

	try {
		const raw = fs.readFileSync(file, 'utf-8')

		if (file.endsWith('.jsonc')) {
			data = parseJSONC(raw)
		}
		else if (file.endsWith('.json')) {
			data = JSON.parse(raw)
		}
		// TODO
		// add general support (for txt and log and stuff)
	}
	catch (e) {
		if (e.code === 'ENOENT') {
			if (file.includes('auth.json')) {
				throw new AuthMissingError()
			}
			else if (file.includes('config.json')) {
				throw new ConfigMissingError()
			}

			fs.mkdirSync(path.dirname(file), { recursive: true })
			fs.writeFileSync(file, JSON.stringify({}, null, '\t'), 'utf-8')

			data = {}
		}
		else {
			throw new UnknownError({ cause: e, fatal: true })
		}
	}

	// TODO
	// add support for writing to jsonc while preserving comments

	Object.defineProperty(data, 'write', {
		value: function () {
			fs.writeFileSync(file, JSON.stringify(this, null, '\t'), 'utf-8')
		},
		enumerable: false,
		writable: true,
		configurable: true
	})

	return data
}

let config = null
config = read('./config.json')

export {
	read,
	config
}