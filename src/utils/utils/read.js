import fs from 'fs';
import path from 'path';

function read(file) {
	let content;

	try {
		content = JSON.parse(fs.readFileSync(file, 'utf-8'));
	}
	catch (e) {
		if (e.code === 'ENOENT') {
			fs.mkdirSync(path.dirname(file), { recursive: true });
			fs.writeFileSync(file, JSON.stringify({}, null, '\t'), 'utf-8');
			content = {};
		}
		else {
			console.error(`Error | Unknown File: ${file}`);
			process.exit(1);
		}
	}

	return new Proxy(content, {
		get(target, prop) {
			if (prop === 'read') return () => (content = read(file));
			if (prop === 'write') {
				return () => {
					try {
						const tempFile = `${file}.temp`;
						fs.writeFileSync(tempFile, JSON.stringify(content, null, '\t'), 'utf-8');
						fs.renameSync(tempFile, file);
					}
					catch (e) {
						console.error(`Error | Failed to write to file: ${file}`, e);
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
