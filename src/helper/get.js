const hypixel = require('../helper/hapi.js');

async function getDiscord(user)
{
	const player = await hypixel.getPlayer(user);
	const discord = await player.socialMedia.find(media => media.id === 'DISCORD');

	return discord;
}

module.exports =
{
	getDiscord
};