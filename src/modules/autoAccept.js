import { config, getUser, MCsend } from '../utils/utils.js';

export { autoAccept };

async function autoAccept(message) {
	if (!config.minecraft.autoAccept.enabled || !message.startsWith('-') || !message.includes('Click here to accept or type /guild accept')) return;

	const match = msg.match(/\/guild accept (\w+)/);
	const ign = match[1];

	const user = await getUser(ign);

	let player;
	try {
		player = await getSkyblock(user.id);
	}
	catch (e) {
		if (e instanceof HypixelNoSkyblockData) return MCsend(`/oc ${user.ign} has never played Skyblock!`);
	}

	const level = player.level;

	if (level >= config.autoAccept.requirement) {
		MCsend(`/oc ${user.ign} meets our req! (${player.level})`);
		return MCsend(`/g accept ${user.ign}`);
	}
	else {
		return MCsend(`/oc ${user.ign} doesn't meets our req! (${player.level})`);
	}
}
