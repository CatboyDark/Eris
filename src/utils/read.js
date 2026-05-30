import { UnknownError, UserError } from '#utils'
import fs from 'fs'

function readJSON(file) {
	return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

let config
try {
	config = readJSON('./config.json')
}
catch (e) {
	if (e.code === 'ERR_MODULE_NOT_FOUND') {
		throw new UserError({ cause: e, message: 'Missing File | config.json', desc: 'For more info, read https://github.com/CatboyDark/Eris', fatal: true })
	}
	else {
		throw new UnknownError({ cause: e })
	}
}

function saveConfig() {
	fs.writeFileSync('./config.json', JSON.stringify(config, null, '\t'))
}

export {
	config,
	readJSON,
	saveConfig
}