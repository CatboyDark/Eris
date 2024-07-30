const mongoose = require('mongoose');

const commandSchema = new mongoose.Schema({
	command: { type: String, required: true, unique: true },
	count: { type: Number, default: 0 }
});

const buttonSchema = new mongoose.Schema({
	button: { type: String, required: true, unique: true },
	source: { type: String, default: '' },
	count: { type: Number, default: 0 }
});

const Command = mongoose.model('Command', commandSchema);
const Button = mongoose.model('Button', buttonSchema);

module.exports = 
{
	Command,
	Button	
};