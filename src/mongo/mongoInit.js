import { mongoose } from 'mongoose';
import config from '../../config.json' with { type: 'json' };

class Mongo
{
	constructor()
	{
		this.URI = config.mongoURI;
	}

	async connect()
	{
		try
		{
			await mongoose.connect(this.URI);
			console.log('Database is online!');
		}
		catch (error)
		{
			console.error('Error connecting to database!\n', error);
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
