import { Schema, model } from 'mongoose';

const commandSchema = new Schema({
	command: { type: String, required: true, unique: true },
	count: { type: Number, default: 0 }
});

const buttonSchema = new Schema({
	button: { type: String, required: true, unique: true },
	source: { type: String, default: '' },
	count: { type: Number, default: 0 }
});

const linkSchema = new Schema(
	{
		uuid: { type: String, required: true },
		dcid: { type: String, required: true }
	},
	{ collection: 'playersLinked' }
);

linkSchema.index({ uuid: 1, dcid: 1 }, { unique: true });

const gxpSchema = new Schema(
	{
		uuid: { type: String, required: true, unique: true },
		entries: [
			{
				date: { type: Number, required: true },
				gxp: { type: Number, required: true }
			}
		]
	},
	{ collection: 'gxpLog' }
);

const Command = model('Command', commandSchema);
const Button = model('Button', buttonSchema);
const Link = model('Link', linkSchema);
const GXP = model('GXP', gxpSchema);

export default {
	Command,
	Button,
	Link,
	GXP
};
