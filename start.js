import { Discord } from './src/discord/Discord.js'
// import { Minecraft } from './src/minecraft/Minecraft.js'

export async function start() {
  await Discord()
  // await Minecraft()
}

start()