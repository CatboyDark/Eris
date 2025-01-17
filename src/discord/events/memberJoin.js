import { Events } from 'discord.js';
import { welcomeMsg, welcomeRole } from '../logic/welcome/welcome.js';

export default 
[
	{
		name: Events.GuildMemberAdd,
		async execute(member) {
			await welcomeMsg(member);
			await welcomeRole(member);
		}
	}
];
