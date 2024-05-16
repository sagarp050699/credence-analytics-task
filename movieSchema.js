const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');
require('dotenv').config();

mongoose.connect(process.env.DATABASENAME, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

const movieSchema = new Schema({
	name: String,
	img: String,
	summary: String,
});

module.exports.Movie = mongoose.model('movie', movieSchema);

module.exports.movieSchema = Joi.object({
	movie: Joi.object({
		name: Joi.string().required(),
		img: Joi.string().required().min(0),
		summary: Joi.string().required(),
	}).required(),
});
