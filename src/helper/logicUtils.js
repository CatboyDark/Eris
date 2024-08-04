const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'discord', 'logic');

function readLogic() 
{
	const modules = {};

	function loadFiles(directory) 
	{
		for (const file of fs.readdirSync(directory)) 
		{
			const filePath = path.join(directory, file);
			const stats = fs.statSync(filePath);

			if (stats.isDirectory()) loadFiles(filePath);
			else if (file.endsWith('.js')) 
			{
				const moduleName = path.basename(file, '.js');
				const moduleExports = require(filePath);

				if (typeof moduleExports === 'object' && moduleExports !== null) Object.assign(modules, moduleExports);
				else modules[moduleName] = moduleExports;
			}
		}
	}

	loadFiles(dir);
	return modules;
}

module.exports = readLogic;
