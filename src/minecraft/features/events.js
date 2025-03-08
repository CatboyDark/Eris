import display from '../../display.js';
import { readConfig } from '../../helper.js';
import { Minecraft, minecraft } from '../Minecraft.js';

export default async () => {
	const config = readConfig();

	minecraft.on('login', () => {
		minecraft.chat('/limbo');
	});

	minecraft.on('kicked', (reason) => {
		display.y(`Kicked: ${reason}`);
		reconnect();
	});

	minecraft.on('end', () => {
		display.y(`${config.ign} has disconnected.`);
		reconnect();
	});

	minecraft.on('error', (error) => {
		display.r(`Error: ${error.message}`);
	});

	function reconnect() {
		display.y('Attempting to reconnect...');
		setTimeout(Minecraft, 5000);
	}
};
