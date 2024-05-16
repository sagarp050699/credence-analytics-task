const express = require('express');
const methodOverride = require('method-override');
const winston = require('winston');
const app = express();
require('dotenv').config();

const { Movie, movieSchema } = require('./movieSchema');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const logConfiguration = {
	transports: [new winston.transports.Console()],
};
const logger = winston.createLogger(logConfiguration);

const validateMovie = (req, res, next) => {
	const { error } = movieSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(', ');
		logger.log({ message: msg, level: 'info' });
		res.send(msg);
	} else next();
};

const catchAsync = (func) => {
	return (req, res, next) => {
		func(req, res, next).catch((e) => {
			logger.log({ message: e.message, level: 'error' });
			res.send(e.message);
		});
	};
};

//Seed data into database route
app.get('/seed', (req, res) => {
	let seedData = [
		{
			name: 'Harry Potter and the Order of the Phoenix',
			img: 'https://bit.ly/2IcnSwz',
			summary:
				"Harry Potter and Dumbledore's warning about the return of Lord Voldemort is not heeded by the wizard authorities who, in turn, look to undermine Dumbledore's authority at Hogwarts and discredit Harry.",
		},
		{
			name: 'The Lord of the Rings: The Fellowship of the Ring',
			img: 'https://www.google.com/imgres?imgurl=https%3A%2F%2Fm.media-amazon.com%2Fimages%2FM%2FMV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY%40._V1_.jpg&imgrefurl=https%3A%2F%2Fwww.imdb.com%2Ftitle%2Ftt0120737%2F&tbnid=6-f04EV6lrjNxM&vet=12ahUKEwiGtO3J94DzAhWMASsKHVS-AcAQMygAegUIARDIAQ..i&docid=EG_nUnHoVl_RiM&w=1978&h=2936&q=lord%20of%20the%20rings&ved=2ahUKEwiGtO3J94DzAhWMASsKHVS-AcAQMygAegUIARDIAQ',
			summary:
				'A young hobbit, Frodo, who has found the One Ring that belongs to the Dark Lord Sauron, begins his journey with eight companions to Mount Doom, the only place where it can be destroyed.',
		},
		{
			name: 'Avengers: Endgame',
			img: 'https://bit.ly/2Pzczlb',
			summary:
				'Adrift in space with no food or water, Tony Stark sends a message to Pepper Potts as his oxygen supply starts to dwindle. Meanwhile, the remaining Avengers -- Thor, Black Widow, Captain America, and Bruce Banner -- must figure out a way to bring back their vanquished allies for an epic showdown with Thanos -- the evil demigod who decimated the planet and the universe.',
		},
	];
	Movie.insertMany(seedData);
	res.send('Data has been seeded');
});

//Show all
app.get(
	'/movies/',
	catchAsync(async (req, res, next) => {
		const movies = await Movie.find({});
		res.send(movies);
	})
);

//Show Movie
app.get(
	'/movies/:id',
	catchAsync(async (req, res, next) => {
		const movie = await Movie.findById(req.params.id);
		if (movie === null) {
			logger.log({ message: 'Movie not found', level: 'info' });
			res.send('Movie not found');
		} else {
			res.send(movie);
		}
	})
);

//Creat Movie
app.post(
	'/movies/',
	validateMovie,
	catchAsync(async (req, res, next) => {
		const movie = new Movie(req.body.movie);
		await movie.save();
		res.redirect(`/movies/${movie._id}`);
	})
);

//Edit Movie
app.put(
	'/movies/:id',
	validateMovie,
	catchAsync(async (req, res, next) => {
		await Movie.findByIdAndUpdate(req.params.id, req.body.movie);
		res.redirect('/movies/' + req.params.id);
	})
);

//Delete Movie
app.delete(
	'/movies/:id',
	catchAsync(async (req, res, next) => {
		if ((await Movie.findById(req.params.id)) === null) {
			logger.log({ level: 'info', message: 'Movie not found' });
			res.send('Movie not found');
		} else {
			await Movie.findByIdAndDelete(req.params.id);
			res.send('Movie Deleted');
		}
	})
);

//Default Route
app.get('*', (req, res) => {
	res.send('INVALID ROUTE TRY AGAIN');
});

app.listen(process.env.port, () => {
	console.log('SERVER STARTED');
});
