const bcrypt = require('bcryptjs');

/**
 * Nessa função, é encriptada a senha e adicionado o sal.
 */
const encrypt = async (password) => {
	const hash = await bcrypt.hash(password, 10);
	return hash;
};

/**
 * Essa função faz a comparação da senha enviada com o hash dela.
 */
const check = async (password, hash) => {
	const comparison = await bcrypt.compare(password, hash);
	return comparison;
};

module.exports = { check, encrypt };
