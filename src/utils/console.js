import { color, config, discord } from '#utils'
import { Team } from 'discord.js'

if (
	console.info.toString().includes('[native code]') &&
	console.warn.toString().includes('[native code]') &&
	console.error.toString().includes('[native code]') &&
	console.debug.toString().includes('[native code]')
) {
	Object.defineProperties(console, {
		info: {
			value: async function (message) {
				console.log(color.black.bold['bg#00B2FF'](' \u2139 ') + ' ' + color['#00B2FF'](message))

				await discord.send(discord.channels.BOT, [
					{
						color: '#00B2FF',
						embed: [
							{
								description:
									message + '\n\n' +
									`<t:${Math.floor(Date.now() / 1000)}:t>`
							}
						]
					}
				]).catch(() => null)

			},
			writable: false, configurable: false, enumerable: true
		},
		warn: {
			value: async function (message, description = null) {
				console.log(color.black.bold['bg#FFCC00'](' ? ') + ' ' + color['#FFCC00'](message))
				if (description) console.log(description)

				await discord.send(discord.channels.BOT, [
					{
						color: '#FFCC00',
						embed: [
							{
								description:
									message + '\n\n' +
									`<t:${Math.floor(Date.now() / 1000)}:t>`
							}
						]
					}
				]).catch(() => null)

			},
			writable: false, configurable: false, enumerable: true
		},
		error: {
			value: async function (message, description) {
				console.log(color.black.bold['bg#FF4D00'](' ✘ ') + ' ' + color['#FF4D00'](message))
				if (description) console.log(description)

				const app = await discord.bot.application.fetch()

				let desc
				if (config.debug) {
					desc =
						'### A silly has occured!\n' +
						`\`\`\`${message}\`\`\`\n` +
						'**Debug Info**\n' +
						`\`\`\`${description}\`\`\`\n` +
						'-# If you believe this is a bug, please contact @catboydark.\n\n' +
						`<t:${Math.floor(Date.now() / 1000)}:t>`
				}
				else {
					desc =
						'### A silly has occured!\n' +
						`\`\`\`${message}\`\`\`\n` +
						'-# If you believe this is a bug, please contact @catboydark.\n\n' +
						`<t:${Math.floor(Date.now() / 1000)}:t>`
				}

				await discord.send(discord.channels.BOT, [
					{
						description: `<@${app.owner instanceof Team ? app.owner.ownerId : app.owner.id}>`
					},
					{
						color: '#FF4D00',
						embed: [
							{
								description: desc
							}
						]
					}
				]).catch(() => null)
			},
			writable: false, configurable: false, enumerable: true
		},
		debug: {
			value: async function (message) {
				if (!config.debug) return
				console.log(color.black.bgGreen.bold['bg#33FF00'](' ~ ') + ' ' + color['#33FF00'](message))

				await discord.send(discord.channels.BOT, [
					{
						color: '#33FF00',
						embed: [
							{
								description:
									message + '\n\n' +
									`<t:${Math.floor(Date.now() / 1000)}:t>`
							}
						]
					}
				]).catch(() => null)
			},
			writable: false, configurable: false, enumerable: true
		}
	})
}
else {
	console.log('THE WORLD IS ENDING!!!')
	console.log('Kidding. But something is hijacking the global console object. Mission abort!')
	process.exit(1)
}