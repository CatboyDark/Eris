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

module.exports =
{
	readConfig,
	writeConfig
};
