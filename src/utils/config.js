import fs from 'fs';

export function readConfig() {
	return JSON.parse(fs.readFileSync('./config.json', 'utf8'));
}

export function writeConfig(config) {
	fs.writeFileSync('./config.json', JSON.stringify(config, null, '\t'), 'utf8');
}
