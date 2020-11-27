const nodemailer = require('nodemailer');

require('dotenv').config();

const config = {
	host: process.env.MAILTRAP_HOST,
	port: process.env.MAILTRAP_PORT,
	secure: false,
	auth: {
		user: process.env.MAILTRAP_USER,
		pass: process.env.MAILTRAP_PASS,
	},
};

const transport = nodemailer.createTransport(config);

const enviarEmail = async (to, subject, html) => {
	const email = await transport.sendMail({
		from: '"Bill & Ted" <billted@cubos.academy>',
		to,
		subject,
		html,
	});
	return email;
};

module.exports = { enviarEmail };
