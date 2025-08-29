import { createMsg, DCsend, read, write } from '../../../utils/utils.js';

export default {
	name: 'setreactionroles',
	desc: 'Setup a reaction roles message',
	options: [
		{ type: 'string', name: 'label', desc: 'Enter a label. Add an emoji to the beginning of the label to set it as the button.', required: true },
		{ type: 'role', name: 'role', desc: 'Enter a role to assign', required: true },
				{ type: 'string', name: 'color', desc: 'Choose a button color', choices:
			[
				{ name: 'Blue', value: 'Blue' },
				{ name: 'Green', value: 'Green' },
				{ name: 'Red', value: 'Red' },
				{ name: 'Gray', value: 'Gray' }
			]
		},
		{ type: 'channel', name: 'channel', desc: 'Enter a channel' }
	],
	permissions: 0,

	async execute(interaction) {
		const label = interaction.options.getString('label');
		const role = interaction.options.getRole('role');
		const color = interaction.options.getString('color') ?? 'Green';
		const channel = interaction.options.getChannel('channel') ?? interaction.channel;

		const emojiMatch = label.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u);
		const emoji = emojiMatch ? emojiMatch[0] : null;

		const id = `rr_${label}`;

		const cache = read('.cache/bot/reactionroles.json');
		cache[id] = role.id;
		write('.cache/bot/reactionroles.json', cache);

		DCsend(channel, [{ embed: [{ desc: `**${label}**` }] }, [{ id, label: emoji ? emoji : label, color }]]);
		interaction.reply(createMsg([{ embed: [{ desc: '**Reaction role has been created!**' }] }], { ephemeral: true }));
	}
};
