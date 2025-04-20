import { readConfig } from '../utils.js';

export {
	getPerms
};

const config = readConfig();

const permissions = new Set([
	'Owner',
	'Admin',
	'KillBot',
	'SetLinkChannel',
	'SetMapChannel',
	'SetEventsChannel',
	'SetStatsChannels',
	'DeleteMessages',
	'RestartBot',
	'LinkOverride',
	'MuteMembers',
	'BanMembers'
]);

function getPerms(member) {
	const roles = member.roles.cache.map(role => role.id);
	const perms = new Set();

	config.permissions.forEach(p => {
		if (roles.includes(p.role)) {
			if (p.perms.includes('Owner')) {
				permissions.forEach(perm => perms.add(perm));
			}
			else if (p.perms.includes('Admin')) {
				permissions.forEach(perm => {
					if (perm !== 'Owner') perms.add(perm);
				});
			}
			else {
				p.perms.forEach(perm => perms.add(perm));
			}
		}
	});
	return [...perms];
}
