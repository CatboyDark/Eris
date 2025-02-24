import mongoose from 'mongoose';
import display from '../display.js';
import auth from '../../auth.json' with { type: 'json' };

async function mongo() {
	try {
		await mongoose.connect(auth.mongoURI);
		display.c('Database is online!');
	}
	catch (error) {
		display.r(`Database > ${error}`);
		process.exit(1);
	}
}

export { mongo };
