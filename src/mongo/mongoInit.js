import { connect as _connect } from 'mongoose';
import { mongoURI } from '../../config.json' with { type: 'json' };

class Mongo
{
	constructor()
	{
		this.URI = mongoURI;
	}

	async connect()
	{
		try
		{
			await _connect(this.URI);
			console.log('ErisDB is online!');
		}
		catch (error)
		{
			console.error('Error connecting to MongoDB:', error);
			process.exit(1);
		}
	}

	static async create()
	{
		const mongo = new Mongo();
		await mongo.connect();
		return mongo;
	}
}

export default async function()
{
	return await Mongo.create();
};

