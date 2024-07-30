const mongoose = require('mongoose');

class mongo
{
	constructor() 
	{
		this.mongoURI = 'mongodb://localhost:27017';
		this.databaseName = 'ErisDB';
	}

	async init() 
	{
		try 
		{
			await mongoose.connect(`${this.mongoURI}/${this.databaseName}`);
			console.log(`${this.databaseName} is online!`);
		} 
		catch (error) 
		{
			console.error('Error connecting to MongoDB:', error);
			process.exit(1);
		}
	}
}

module.exports = new mongo;