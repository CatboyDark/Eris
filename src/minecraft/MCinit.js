import mineflayer from 'mineflayer';
import fs from 'fs';
import config from '../../config.json' with { type: 'json' };
import { getMsg } from './logic/chat.js';

class MC {
	constructor(client) {
		this.client = client;
		this.instance = {
			host: 'mc.hypixel.net',
			username: config.ign,
			auth: 'microsoft',
			version: '1.8.9',
			viewDistance: 'tiny',
			chatLengthLimit: 256
		};
		this.bot = mineflayer.createBot(this.instance);
	}

	async init() {
		await this.initCmds();
		await this.initFeatures();
		await this.initLogic();
		this.initEvents();
	}

	async initCmds() {
		this.cList = new Map();
		const cFiles = fs.readdirSync('./src/minecraft/cmds').filter((file) => file.endsWith('.js'));

		for (const c of cFiles) {
			const cmd = await import(`./cmds/${c}`);
			if (cmd.command) {
				this.cList.set(cmd.command.toLowerCase(), cmd);
			}
		}

		this.bot.on('message', (message) => {
			const { chat, rank, guildRank, sender, content } = getMsg(message.toString());
			if (!content) return;
			const [commandName, ...args] = content.split(/ +/);
			const command = commandName.toLowerCase();

			if (this.cList.has(command)) {
				const cmd = this.cList.get(command);
				if (cmd.chat.includes(chat) || (chat === 'staff' && cmd.chat.includes('guild'))) {
					const msg = { chat, rank, guildRank, sender, content, args };
					cmd.execute(this.client, msg);
				}
			}
		});
	}

	async initFeatures() {
		const fFiles = fs.readdirSync('./src/minecraft/features').filter((file) => file.endsWith('.js'));

		for (const f of fFiles) {
			const module = await import(`./features/${f}`);
            const feature = module.default;
			if (typeof feature === 'function') {
				feature(this.bot, this.client);
			}
			else {
				console.error(`Error: Feature at ./src/minecraft/features/${f} is not a function.`);
			}
		}
	}

	async initLogic() {
		this.Logic = {};
		const lFiles = fs.readdirSync('./src/minecraft/logic').filter((file) => file.endsWith('.js'));

		for (const file of lFiles) {
			const logicModule = `./src/minecraft/logic/${file}`;
			if (typeof logicModule === 'object' && logicModule !== null) {
				Object.assign(this.Logic, logicModule);
			}
			else {
				this.Logic[file.replace('.js', '')] = logicModule;
			}
		}
	}

	initEvents() {
		this.bot.on('login', this.onLogin.bind(this));
		this.bot.on('kicked', this.onKick.bind(this));
		this.bot.on('error', this.onError.bind(this));
		this.bot.on('end', this.onEnd.bind(this));
	}

	onLogin() {
		const { server, _host } = this.bot._client.socket;
		console.log(`${this.instance.username} has joined ${server || _host}.`);
		this.bot.chat('/limbo');
	}

	onKick(reason) {
		console.log(`Kicked: ${reason}`);
		this.reconnect();
	}

	onError(error) {
		console.error(`Error: ${error.message}`);
	}

	onEnd() {
		console.log(`${this.instance.username} has disconnected.`);
		this.reconnect();
	}

	reconnect() {
		console.log('Attempting to reconnect in 10 seconds...');
		setTimeout(() => {
			this.bot = createBot(this.instance);
			this.bot.once('spawn', () => {
				console.log('Reconnected.');
				this.bot.chat('/limbo');
			});
		}, 10000);
	}
}

export default MC;
