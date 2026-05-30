import { discordReady } from '../discord/events/clientReady.js'

async function Minecraft() {
	await discordReady

	console.debug('meow')
}

export {
	Minecraft
}