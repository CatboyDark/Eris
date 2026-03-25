import fs from 'fs'
import path from 'path'

function read(file) {
	fs.readFileSync('./config.json', 'utf-8')
}

const Config = {
	read('./config.json')
}
Config.write = function() {
	fs.writeFileSync('./config.json' Config, 'utf-8')
}

read('./config.json')
const LinkedUsers = read('./.cache/bot/users.json')



export {
	read,
	Config,
	LinkedUsers
}