import { discord } from '../../discord/Discord.js';
import { readConfig, writeConfig } from '../../helper.js';
import { minecraft } from '../Minecraft.js';
import * as emoji from 'node-emoji';
import fs from 'fs';

export default async () => {
	const config = readConfig();
	const ignore = JSON.parse(fs.readFileSync('./assets/ignore.json', 'utf8'));

	const logsChannel = discord.channels.cache.get(config.logs.channel);
	let consoleChannel = logsChannel.threads.cache.find(x => x.name === 'Console');
	if (!consoleChannel) {
		consoleChannel = await logsChannel.threads.create({ name: 'Console' });
		config.logs.console = consoleChannel.id;
		writeConfig(config);
	}
	const guildChannel = discord.channels.cache.get(config.bridge.guild.channel);
	const officerChannel = discord.channels.cache.get(config.bridge.officer.channel);

	minecraft.on('message', (message) => {
		const msg = filter(message.toString().trim());

		const isIgnored = ignore.some((ignored) => msg.startsWith(ignored));
		if (msg.length < 1 || isIgnored) return;

		consoleChannel.send(msg);

		if (config.bridge.guild.enabled) {
			if (msg.startsWith('Guild >') && !msg.startsWith('Guild > [VIP+] CatboyLight')) {
				const newMsg = msg.replace(/^Guild >\s*/, '').replace(/([*_~`>\\])/g, '\\$1');
				guildChannel.send(newMsg);
			}
		}

		if (config.bridge.officer.enabled) {
			if (msg.startsWith('Officer >') && !msg.startsWith('Officer > [VIP+] CatboyLight')) {
				const newMsg = msg.replace(/^Officer >\s*/, '').replace(/([*_~`>\\])/g, '\\$1');
				officerChannel.send(newMsg);
			}
		}
	});

	discord.on('messageCreate', (message) => {
		if (message.author.bot) return;

		const user = message.member.nickname ?? message.author.username;
		let msg = filter(message.content);
		if (message.attachments.size > 0) {
			msg = msg ? `[image] ${msg}` : '[image]';
		}
		if (message.stickers.size > 0) {
			const sticker = message.stickers.first();
			msg = `[${sticker.name}]`;
		}

		if (message.channel.id === consoleChannel.id) {
			if (msg !== '/g disband' && !msg.includes('/g transfer') && !msg.includes('/g confirm')) {
				minecraft.chat(msg);
			}
		}

		if (config.bridge.guild.enabled && message.channel.id === guildChannel.id) {
			minecraft.chat(`/gc ${user} > ${msg}`);
		}

		if (config.bridge.officer.enabled && message.channel.id === officerChannel.id) {
			minecraft.chat(`/oc ${user} > ${msg}`);
		}
	});
};

function filter(content) {
	content = content
	.replace(/\n/g, ' ')
	.replace('@everyone', '@everyone')
	.replace('@here', '@here')
	.replace(/<@!?(\d+)>/g, (_, id) => {
		const user = discord.users.cache.get(id);
		if (user) {
			return `@${user.nickname ?? user.username}`;
		}
		return `<@${id}>`;
	})
	.replace(/<#(\d+)>/g, (_, channelId) => {
		const channel = discord.channels.cache.get(channelId);
		return channel ? `#${channel.name}` : `<#${channelId}>`;
	});

	content = emoji.unemojify(content);

	return content;
}
