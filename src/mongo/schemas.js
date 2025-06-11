import mongoose, { Schema } from 'mongoose';

export {
	getMongo,
	gxpSchema,
	membersSchema
};

function getMongo(collection, schema) {
	return mongoose.connection.useDb('Eris').model(collection, schema, collection);
}

const membersSchema = new Schema({
	uuid: { type: String, required: true, unique: true },
	dcid: { type: String, required: true, unique: true }
});

const gxpSchema = new Schema({
	date: { type: Number, required: true, index: true },
	uuid: { type: String, required: true, index: true },
	gxp: { type: Number, required: true }
});
