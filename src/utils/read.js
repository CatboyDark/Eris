import fs from 'fs'
import path from 'path'

function readJSON(file) {
	const dir = path.dirname(file)
	const state = {}

	let isWriting = false
	let debounce

	function load() {
		try {
			const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
			for (const key of Object.keys(state)) delete state[key]
			Object.assign(state, data)
		}
		catch (e) {
			if (e.code === 'ENOENT') {
				fs.mkdirSync(dir, { recursive: true })
				fs.writeFileSync(file, '{}', 'utf-8')
			}
			else {
				console.error(`File Read | ${file}`, e)
			}
		}
	}

	function write() {
		try {
			isWriting = true
			const temp = `${file}.temp`
			fs.writeFileSync(temp, JSON.stringify(state, null, '\t'), 'utf-8')
			fs.renameSync(temp, file)
		}
		catch (e) {
			console.error(`File Write | ${file}`, e)
		}
		finally {
			isWriting = false
		}
	}

	load()

	fs.watch(file, { persistent: false }, () => {
		if (isWriting) return

		clearTimeout(debounce)
		debounce = setTimeout(load, 50)
	})

	return new Proxy(state, {
		get(target, prop) {
			if (prop === 'read') return load
			if (prop === 'write') return write
			return target[prop]
		},
		set(target, prop, value) {
			target[prop] = value
			return true
		}
	})
}

const Config = readJSON('./config.json')
const LinkedUsers = readJSON('./.cache/bot/users.json')

function readTXT(file) {
	const dir = path.dirname(file)
	const state = { content: '' }

	let isWriting = false
	let debounce

	function load() {
		try {
			const data = fs.readFileSync(file, 'utf-8')
			state.content = data
		}
		catch (e) {
			if (e.code === 'ENOENT') {
				fs.mkdirSync(dir, { recursive: true })
				fs.writeFileSync(file, '', 'utf-8')
				state.content = ''
			}
			else {
				console.error(`File Read | ${file}`, e)
			}
		}
	}

	function write() {
		try {
			isWriting = true
			const temp = `${file}.temp`
			fs.writeFileSync(temp, state.content, 'utf-8')
			fs.renameSync(temp, file)
		}
		catch (e) {
			console.error(`File Write | ${file}`, e)
		}
		finally {
			isWriting = false
		}
	}

	load()

	fs.watch(file, { persistent: false }, () => {
		if (isWriting) return

		clearTimeout(debounce)
		debounce = setTimeout(load, 50)
	})

	return new Proxy(state, {
		get(target, prop) {
			if (prop === 'read') return load
			if (prop === 'write') return write
			return target[prop]
		},
		set(target, prop, value) {
			target[prop] = value
			return true
		}
	})
}

export {
	readJSON,
	readTXT,
	Config,
	LinkedUsers
}