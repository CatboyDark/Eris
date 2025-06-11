import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

function saveConfig() {
	fs.writeFileSync('./config.json', JSON.stringify(config, null, 2), 'utf8');
}

export {
	config,
	saveConfig
};
