export { colon_three };

const colon_three = {
	async discord(message) {
		if (message.content.includes(':3')) return message.channel.send(':3');
	},

	async minecraft(message) {
		if (message.content.includes(':3')) return message.reply(':3');
	}
};
