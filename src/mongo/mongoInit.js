const mongoose = require('mongoose');

class Mongo
{
	constructor(URI) 
	{
		this.URI = URI;
	}

	async connect() 
	{
		try 
		{
			await mongoose.connect(`${this.URI}`);
			console.log('Mongo is online!');
		} 
		catch (error) 
		{
			console.error('Error connecting to MongoDB:', error);
			process.exit(1);
		}
	}

	static async init(URI) 
	{
		const mongo = new Mongo(URI);
		await mongo.connect();

		return mongo;
	}
}

module.exports = Mongo;