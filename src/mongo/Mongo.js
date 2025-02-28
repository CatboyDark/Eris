import mongoose from 'mongoose';
import display from '../display.js';
import auth from '../../auth.json' with { type: 'json' };

export { mongo };

async function mongo() {
	try {
		await mongoose.connect(auth.mongoURI);
		display.c('Database is online!');
	}
	catch (e) {
		display.r(`Database > ${e}`);
		process.exit(1);
	}
}
