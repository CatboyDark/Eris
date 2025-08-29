import fs from 'fs';
import path from 'path';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

function saveConfig() {
	fs.writeFileSync('./config.json', JSON.stringify(config, null, '\t'), 'utf8');
}

function read(file) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf-8'));
	}
	catch (e) {
		if (e.code === 'ENOENT') {
			fs.mkdirSync(path.dirname(file), { recursive: true });
			fs.writeFileSync(file, JSON.stringify({}, null, '\t'), 'utf-8');
			return {};
		}
		else {
			console.error(`Error | Unknown File: ${file}`);
			process.exit(0);
		}
	}
}

function write(file, data) {
	return fs.writeFileSync(file, JSON.stringify(data, null, '\t'), 'utf-8');
}

export {
	config,
	saveConfig,
	read,
	write
};
