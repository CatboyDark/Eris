import mongoose from 'mongoose';
import display from '../display.js';
import { readConfig } from '../helper.js';

async function mongo() {
	const config = readConfig();
	const URI = config.mongoURI;

	try {
		await mongoose.connect(URI);
		display.c('Database is online!');
	}
	catch (error) {
		display.r(`Database > ${error}`);
		process.exit(1);
	}
}

export { mongo };
