import mongoose from 'mongoose';
import auth from '../../auth.json' with { type: 'json' };
import { display } from '../utils/utils.js';

export { Mongo };

async function Mongo() {
	try {
		await mongoose.connect(auth.mongoURI);
		display.c('Database is online!');
	}
	catch (e) {
		display.r('Database >', e);
		process.exit(1);
	}
}
