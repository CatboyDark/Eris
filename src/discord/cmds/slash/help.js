import { cmds } from '../../logic/help/help.js';

export default 
{
	name: 'help',
	desc: 'Display bot info',
	
	async execute(interaction) {
		await cmds(interaction);
	}
};
