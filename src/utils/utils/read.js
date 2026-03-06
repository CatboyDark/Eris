import fs from 'fs';
import path from 'path';
import { parse as parseJSONC } from 'jsonc-parser';

function read(file) {
	const dir = path.dirname(file)
	const state = {}

	let isWriting = false
	let debounce

	function load() {
		try {
			const raw = fs.readFileSync(file, 'utf-8');

			let data;
			if (file.endsWith('.jsonc')) {
				data = parseJSONC(raw);
			}
			else {
				data = JSON.parse(raw);
			}

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

const Config = read('./config.json');
const LinkedUsers = read('./.cache/bot/users.json');

function readTXT(file) {
	let content;

	try {
		content = fs.readFileSync(file, 'utf-8');
	}
	catch (e) {
		if (e.code === 'ENOENT') {
			fs.mkdirSync(path.dirname(file), { recursive: true });
			fs.writeFileSync(file, '', 'utf-8');
			content = '';
		}
		else {
			console.error(`Error | Unknown File: ${file}`, e);
			process.exit(1);
		}
	}

	return new Proxy({ content }, {
		get(target, prop) {
			if (prop === 'read') {
				return () => {
					target.content = fs.readFileSync(file, 'utf-8');
					return target.content;
				};
			}
			if (prop === 'write') {
				return () => {
					fs.writeFileSync(file, target.content, 'utf-8');
				};
			}
			if (prop === 'delete') {
				return () => {
					if (fs.existsSync(file)) {
						fs.unlinkSync(file);
						target.content = '';
					}
				};
			}
			return target[prop];
		},
		set(target, prop, value) {
			target[prop] = value;
			return true;
		}
  });
}

export {
	read,
	readTXT,
	Config,
	LinkedUsers
};
