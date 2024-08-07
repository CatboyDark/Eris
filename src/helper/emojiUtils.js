const { appID, token } = require('../../config.json');

async function getEmoji(name) 
{
	const url = `https://discord.com/api/v10/applications/${appID}/emojis`;

	try 
	{
		const { default: fetch } = await import('node-fetch');
		const response = await fetch(url, {
			headers: {
				Authorization: `Bot ${token}`
			}
		});
		if (!response.ok) throw new Error(`Failed to fetch emojis: ${response.statusText}`);

		const data = await response.json();

		const emojis = data.items;

		const emoji = emojis.find(e => e.name === name);
		return emoji || null;
	} 
	catch (error) 
	{
		console.error('Error fetching emoji:', error);
		throw error;
	}
}

module.exports = getEmoji;
