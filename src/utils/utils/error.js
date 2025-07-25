import { createMsg } from './discord.js';

export {
	userError,
	UnknownError,
	InvalidIGN,
	HypixelInvalidAPIKey,
	HypixelInvalidGuild,
	HypixelRateLimit,
	MissingRolePerms,
	InvalidRole
};

const userError = createMsg([{ color: 'Error', embed: [{ desc: '### Oops!\nThat wasn\'t supposed to happen! Staff has been notified.' }] }]);

class UnknownError extends Error {
	constructor(response) {
		super(`Unknown Error | ${response.status} ${response.statusText}`);
	}
}

class InvalidIGN extends Error {
	constructor() {
		super('Error | Invalid Player');
	}
}

class HypixelInvalidAPIKey extends Error {
	constructor() {
		super('Error | Invalid Hypixel API Key');
	}
}

class HypixelInvalidGuild extends Error {
	constructor() {
		super('Error | Invalid Guild');
	}
}

class HypixelRateLimit extends Error {
	constructor() {
		super('Error | Hypixel Rate Limit');
	}
}

class MissingRolePerms extends Error {
	constructor(roleID) {
		super(`Error | I am uanble to assign or remove <@${roleID}>`);
	}
}

class InvalidRole extends Error {
	constructor(role) {
		super(`Error | Invalid Role: ${role}`);
	}
}
