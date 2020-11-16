const { Client } = require('pg');

require('dotenv').config();

const database = new Client({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	password: process.env.DB_PW,
	user: process.env.DB_USER,
	database: process.env.DB_NAME,
	ssl: {
		rejectUnauthorized: false,
	},
});

database
	.connect()
	.then(() => console.log('connected'))
	.catch((err) => console.error('connection error', err.stack));

module.exports = database;
