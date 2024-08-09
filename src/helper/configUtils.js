const fs = require('fs');
const path = require('path');
const configs = path.join(__dirname, '../../config.json');

function readConfig()
{
	return JSON.parse(fs.readFileSync(configs, 'utf8'));
}

function writeConfig(newConfig)
{
	fs.writeFileSync(configs, JSON.stringify(newConfig, null, 2), 'utf8');
}

async function toggleConfig(path) 
{
	const config = readConfig();
	const keys = path.split('.');
	const lastKey = keys.pop();
	let current = config;

	for (const key of keys) 
	{
		if (current[key] === undefined) return console.log(`Path not found: ${path}`);
		current = current[key];
	}

	if (typeof current[lastKey] !== 'boolean') return console.log('This is not a valid config!');
	current[lastKey] = !current[lastKey];

	writeConfig(config);
}


module.exports =
{
	readConfig,
	writeConfig,
	toggleConfig
};