import fs from 'fs';
import mineflayer from 'mineflayer';
import { config, DCsend } from '../utils/utils.js';
import { ChatManager } from './ChatManager.js';
import { mcReady } from '../modules/bridge.js';

export { Minecraft, mcCommands };

export let minecraft;
const mcCommands = new Map();

async function Minecraft() {
	if (!config.minecraft.enabled) return;

	minecraft = mineflayer.createBot({
		host: 'mc.hypixel.net',
		username: config.ign,
		auth: 'microsoft',
		version: '1.8.9',
		viewDistance: 'tiny',
		chatLengthLimit: 256,
		profilesFolder: './.cache/minecraft'
	});

	await mcEvents();
	await loadCommands();
}

globalThis.mcConnected = false;
globalThis.ChatManInitialized = false;

async function mcEvents() {
	minecraft.on('kicked', (reason) => {
		globalThis.mcConnected = false;

		console.yellow(`Minecraft | Kicked: ${reason}`);
		reconnect();
	});

	minecraft.on('end', (reason) => {
		globalThis.mcConnected = false;

		console.yellow(`Minecraft | Disconnected: ${reason}`);
		reconnect();
	});

	minecraft.on('error', (error) => {
		console.error(`Minecraft | ${error.message}`);
	});

	function reconnect() {
		console.yellow('Attempting to reconnect...');
		setTimeout(Minecraft, 5000);
	}

	minecraft.once('spawn', async () => {
		globalThis.mcConnected = true;

		console.cyan(`${minecraft.username} is online!`);
		DCsend(config.logs.bot.channelID, [{ embed: [{ desc: `**${minecraft.username}** is online!` }]} ]);

		minecraft.chat('/limbo');
		if (!globalThis.ChatManInitialized) await ChatManager();
		mcReady();
		// testSpamBypass().then(results => {
		// 	console.log('Test completed:', results);
		// });
	});
}

async function testSpamBypass() {
    const prefix = '/oc';
    const maxLen = 252;

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function sendMessage(message) {
        return new Promise((resolve) => {
            let responded = false;
            const timeout = setTimeout(() => {
                if (!responded) {
                    responded = true;
                    minecraft.removeListener('message', listener);
                    resolve({ success: null, response: 'TIMEOUT' });
                }
            }, 2000);

            const listener = (responseMessage) => {
                if (responded) return;

                const response = responseMessage.toString().trim();
                console.log(`Server response: ${response}`);

                // Check for spam filter responses
                if (response.includes('cannot say the same message') ||
                    response.includes('spam') ||
                    response.includes('duplicate')) {
                    responded = true;
                    clearTimeout(timeout);
                    minecraft.removeListener('message', listener);
                    resolve({ success: false, response });
                }
                else if (response.includes(message.substring(0, Math.min(10, message.length)))) {
                    responded = true;
                    clearTimeout(timeout);
                    minecraft.removeListener('message', listener);
                    resolve({ success: true, response });
                }
            };

            minecraft.on('message', listener);
            minecraft.chat(`${prefix} ${message}`);
        });
    }

    const results = {};

    // Global character index that continues across all message lengths
    let globalCharIndex = 0;
    const alphabet = 'abcdefghijmnopqrstuvwxyz'; // Skip 'k' and 'l'

    // Test each message length
    const prefixLength = 4; // "/oc "
    for (let msgLen = 1; msgLen <= maxLen - prefixLength; msgLen++) {
        console.log(`\n=== Testing message length ${msgLen} ===`);
        const baseMessage = 'a'.repeat(msgLen);

        // First send the base message
        console.log(`Sending: "${baseMessage}"`);
        await sendMessage(baseMessage);
        await sleep(1500);

        // Try sending it again to trigger duplicate detection
        console.log(`Testing duplicate: "${baseMessage}"`);
        const duplicateResult = await sendMessage(baseMessage);
        await sleep(1500);

        if (duplicateResult.success === false) {
            console.log(`Duplicate detected, finding minimum spam length...`);

            let found = false;
            let spamLen = 1;
            const alphabet = 'abcdefghijmnopqrstuvwxyz'; // Skip 'k' and 'l'
            let consecutiveSuccesses = 0;
            const requiredSuccesses = 3;

            while (!found && spamLen <= 20) {
                const char = alphabet[globalCharIndex % alphabet.length];
                const spamString = char.repeat(spamLen);
                const testMsg = `${baseMessage} - ${spamString}`;

                const totalLength = prefixLength + testMsg.length;
                if (totalLength > maxLen) {
                    console.log(`Total message too long: ${totalLength} > ${maxLen}`);
                    break;
                }

                console.log(`Testing: "${testMsg}"`);
                const result = await sendMessage(testMsg);
                await sleep(1500);

                if (result.success === true) {
                    consecutiveSuccesses++;
                    console.log(`✓ Success (${consecutiveSuccesses}/${requiredSuccesses})`);

                    if (consecutiveSuccesses >= requiredSuccesses) {
                        console.log(`✓ Found working spam length for message length ${msgLen}: ${spamLen}`);
                        results[msgLen] = spamLen;
                        found = true;
                    }
					else {
                        // Continue with next character at same spam length
                        globalCharIndex++;
                    }
                }
				else {
                    console.log(`✗ Failed - moving to next spam length`);
                    consecutiveSuccesses = 0;
                    spamLen++;
                    globalCharIndex++; // Move to next character for the new spam length
                }
            }

            if (!found) {
                console.log(`✗ Could not find working spam length for message length ${msgLen}`);
                results[msgLen] = -1; // Indicate failure
            }
        }
		 else {
            console.log(`No duplicate detection for length ${msgLen}`);
            results[msgLen] = 0; // No spam needed
        }

        await sleep(2000);
    }

    console.log('\n=== Final Results ===');
    for (const [msgLen, spamLen] of Object.entries(results)) {
        console.log(`Message length ${msgLen}: minimum spam length ${spamLen}`);
    }

    return results;
}

let mcCommandsResolve;
export const mcCommandsReady = new Promise(res => { mcCommandsResolve = res; });

function mccReady() {
	mcCommandsResolve();
}

async function loadCommands() {
	const dir = fs.readdirSync('./src/minecraft/commands').filter(file => file.endsWith('.js'));
	const seen = new Set();

	for (const file of dir) {
		const commandName = file.replace('.js', '');
		if (!config.minecraft.commands[commandName]) {
			console.yellow(`Disabling MC command: ${commandName}`);
			continue;
		}

		const command = (await import(`./commands/${file}`)).default;
		const commands = Array.isArray(command) ? command : [command];

		for (const c of commands) {
			if (!c || !c.name) {
				console.yellow(`Invalid MC command: ${commandName}`);
				continue;
			}

			const entries = [];
			const baseName = c.prefix ? `${config.prefix}${c.name}` : c.name;
			entries.push(baseName.toLowerCase());

			if (Array.isArray(c.aliases)) {
				for (const alias of c.aliases) {
					const aliasName = c.prefix ? `${config.prefix}${alias}` : alias;
					entries.push(aliasName.toLowerCase());
				}
			}

			for (const name of entries) {
				if (seen.has(name)) {
					console.error(`Error | MC command name conflict: ${name} from ${file}`);
					continue;
				}
			}

			for (const name of entries) {
				seen.add(name);
				mcCommands.set(name, c);
			}
		}
	}

	mccReady();
}
