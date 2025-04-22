import { display } from '../../utils/utils.js';
import { Minecraft, minecraft } from '../Minecraft.js';

export { mcEvents };

async function mcEvents() {
	minecraft.on('login', () => {
		minecraft.chat('/limbo');
	});

	minecraft.on('kicked', (reason) => {
		display.y(`Kicked: ${reason}`);
		reconnect();
	});

	minecraft.on('end', () => {
		display.y(`${config.ign} has disconnected.`);
	});

	minecraft.on('error', (error) => {
		display.r(`Error: ${error.message}`);
	});

	function reconnect() {
		display.y('Attempting to reconnect...');
		setTimeout(Minecraft, 5000);
	}
}
