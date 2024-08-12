const { Events } = require('discord.js');
const { readConfig } = require('../../helper/utils.js');
const { welcomeMsg, welcomeRole } = require('../logic/welcome/welcome.js');

module.exports = 
{
	name: Events.GuildMemberAdd,
	async execute(member) 
	{
		const config = readConfig();
		if (member.guild.id !== config.serverID) return;

		await welcomeMsg(member);
		await welcomeRole(member);
	}
};
