import { config, getSkyblock, getUser, HypixelNoSkyblockData, MCsend } from '../utils/utils.js';

export { memberJoin };

async function memberJoin(message) {
	console.log('[memberJoin] Received message:', message);

	await autoAccept(message);
	await joinMessage(message);
}

async function autoAccept(message) {
	console.log('[autoAccept] Checking auto accept conditions...');
	if (!config.minecraft.memberJoin.autoAccept.enabled) {
		console.log('[autoAccept] Auto accept disabled.');
		return;
	}
	if (!message.startsWith('-')) {
		console.log('[autoAccept] Message does not start with "-"');
		return;
	}
	if (!message.includes('Click here to accept or type /guild accept')) {
		console.log('[autoAccept] Message does not include accept text.');
		return;
	}

	const match = message.match(/\/guild accept (\w+)/);
	if (!match) {
		console.log('[autoAccept] No match for /guild accept.');
		return;
	}
	const ign = match[1];
	console.log('[autoAccept] Found IGN:', ign);

	let user;
	try {
		user = await getUser(ign);
		console.log('[autoAccept] User data:', user);
	}
	catch (err) {
		console.error('[autoAccept] getUser failed:', err);
		return;
	}

	let player;
	try {
		player = await getSkyblock(user.id);
		console.log('[autoAccept] Player data:', player);
	}
	catch (e) {
		if (e instanceof HypixelNoSkyblockData) {
			console.warn('[autoAccept] No Skyblock data for:', user.ign);
			return MCsend(`/oc ${user.ign} has never played Skyblock!`);
		}
		else {
			console.error('[autoAccept] Unexpected error in getSkyblock:', e);
		}
	}

	const level = player?.level;
	console.log('[autoAccept] Player level:', level);

	if (level >= config.minecraft.memberJoin.autoAccept.requirement) {
		console.log('[autoAccept] Meets requirement, accepting.');
		MCsend(`/oc ${user.ign} meets our req! (${player.level})`);
		return MCsend(`/g accept ${user.ign}`);
	}
	else {
		console.log('[autoAccept] Does not meet requirement.');
		return MCsend(`/oc ${user.ign} doesn't meet our req! (${player.level})`);
	}
}

async function joinMessage(message) {
	console.log('[joinMessage] Checking join message conditions...');
	if (!config.minecraft.memberJoin.joinMessage.enabled) {
		console.log('[joinMessage] Join message disabled.');
		return;
	}

	const match = message.match(/^(?:\[[^\]]+\] )?(\w+) joined the guild!$/);
	if (!match) {
		console.log('[joinMessage] No match for join message.');
		return;
	}

	const ign = match[1];
	console.log('[joinMessage] Player joined:', ign);

	setTimeout(() => {
		const msg = config.minecraft.memberJoin.joinMessage.message?.replace('@ign', ign)
			?? `Welcome ${ign}!`;
		console.log('[joinMessage] Sending join message:', msg);
		MCsend('/gc ' + msg);
	}, 3000);
}
