import mongoose, { Schema } from 'mongoose';

export {
	membersDB,
	gxpDB
};

const membersSchema = new Schema({
	uuid: { type: String, required: true, unique: true },
	dcid: { type: String, required: true, unique: true }
});

const gxpSchema = new Schema({
	date: { type: Number, required: true, index: true },
	uuid: { type: String, required: true, index: true },
	gxp: { type: Number, required: true }
});

const db = mongoose.connection.useDb('Eris');

const membersDB = db.model('members', membersSchema);
const gxpDB = db.model('gxp', gxpSchema);
