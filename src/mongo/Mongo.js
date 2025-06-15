import mongoose from 'mongoose';
import auth from '../../auth.json' with { type: 'json' };

export { Mongo };

async function Mongo() {
	try {
		await mongoose.connect(auth.mongoURI);
		console.cyan('Database is online!');
	}
	catch (e) {
		console.error('! Database >', e);
		process.exit(1);
	}
}
