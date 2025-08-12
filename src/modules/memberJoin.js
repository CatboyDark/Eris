import { config, getSkyblock, getUser, HypixelNoSkyblockData, MCsend } from '../utils/utils.js';

export { memberJoin };

async function memberJoin(message) {
	await autoAccept(message);
	await joinMessage(message);
}

async function autoAccept(message) {
	if (!config.minecraft.memberJoin.autoAccept.enabled || !message.startsWith('-') || !message.includes('Click here to accept or type /guild accept')) return;

	const match = message.match(/\/guild accept (\w+)/);
	const ign = match[1];

	const user = await getUser(ign);

	let player;
	try {
		player = await getSkyblock(user.id);
	}
	catch (e) {
		if (e instanceof HypixelNoSkyblockData) return MCsend(`/oc ${user.ign} has never played Skyblock!`);
		else console.error(e);
	}

	const level = player.level;

	if (level >= config.minecraft.memberJoin.autoAccept.requirement) {
		MCsend(`/oc ${user.ign} meets our req! (${player.level})`);
		return MCsend(`/g accept ${user.ign}`);
	}
	else {
		return MCsend(`/oc ${user.ign} doesn't meets our req! (${player.level})`);
	}
}

async function joinMessage(message) {
	if (!config.minecraft.memberJoin.joinMessage.enabled) return;

	const match = message.match(/^(?:\[[^\]]+\] )?(\w+) joined the guild!$/);
	if (!match) return;

	const ign = match[1];

	setTimeout(() => {
		MCsend('/gc ' + config.minecraft.memberJoin.joinMessage.message.replace('@ign', ign) ?? `Welcome ${ign}!`);
	}, 3000);
}
