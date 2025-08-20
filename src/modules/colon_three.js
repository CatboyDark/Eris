export { colon_three };

const colonThreeRegex = /(?:^|\W):3(?:$|\W)/;

const colon_three = {
	async discord(message) {
		if (colonThreeRegex.test(message.content)) {
			return message.channel.send(':3');
		}
	},

	async minecraft(message) {
		if (colonThreeRegex.test(message.content)) {
			return message.reply(':3');
		}
	}
};
