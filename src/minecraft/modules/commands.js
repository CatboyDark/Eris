import { send } from '../../utils/utils.js';
import { mcCommands, minecraft } from '../Minecraft.js';

export { commands };

async function commands(msg) {
	if (!msg.channel || msg.sender === minecraft.username || msg.event) return;

	const args = msg.content.match(/"([^"]+)"|'([^']+)'|\S+/g)?.map(arg => arg.replace(/^["']|["']$/g, '')) || [];
	const isCommand = args[0].toLowerCase();

	if (!isCommand || !mcCommands.has(isCommand)) return;
	const command = mcCommands.get(isCommand);
	if (!command.channel.includes(msg.channel)) return;

	const options = {};
	if (command.options) {
		command.options.forEach((option, index) => {
			options[option] = args[index + 1];
		});
	}

	msg.options = options;

	msg.reply = (content) => {
		send(msg.channel, msg.sender, content);
	};

	try {
		command.execute(msg);
	}
	catch (e) {
		console.error(e);
	}
}
