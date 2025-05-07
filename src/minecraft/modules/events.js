import { display } from '../../utils/utils.js';
import { Minecraft, minecraft } from '../Minecraft.js';

export { mcEvents };

async function mcEvents() {
	minecraft.on('spawn', () => {
		minecraft.chat('/limbo');
	});

	minecraft.on('kicked', (reason) => {
		display.y(`Kicked: ${reason}`);
		reconnect();
	});

	minecraft.on('end', () => {
		display.y(`${minecraft.username} has disconnected.`);
		reconnect();
	});

	minecraft.on('error', (error) => {
		display.r(`Minecraft > ${error.message}`);
	});

	function reconnect() {
		display.y('Attempting to reconnect...');
		setTimeout(Minecraft, 10000);
	}
}
