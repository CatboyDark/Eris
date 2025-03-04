import mongoose, { Schema } from 'mongoose';

export {
	getMongo,
	gxpSchema,
	membersSchema
};

function getMongo(db, collection, schema) {
	return mongoose.connection.useDb(db).model(collection, schema, collection);
}

const membersSchema = new Schema(
	{
		uuid: { type: String, required: true, unique: true },
		dcid: { type: String, required: true, unique: true }
	},
	{
		collection: 'members'
	}
);

const gxpSchema = new Schema(
	{
		date: { type: Number, required: true, unique: true, index: { type: -1 } },
		entries: [
			{
				uuid: { type: String, required: true },
				gxp: { type: Number, required: true }
			}
		]
	}
);
