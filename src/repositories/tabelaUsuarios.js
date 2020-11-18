const database = require('../utils/database');

const criarTabelaUsuario = async () => {
	const query = `CREATE TABLE IF NOT EXISTS usuarios (
		id SERIAL,
		email VARCHAR(50),
		senha TEXT,
		nome TEXT
	)`;

	return database.query(query);
};

/**
 * Função para identificar se já existe algum email na hora de criar usuário.
 */
const localizarUsuario = async (email) => {
	const query = `SELECT * FROM usuarios WHERE email = '${email}'`;
	return database.query(query);
};

const localizarId = async (id) => {
	const query = `SELECT * FROM usuarios WHERE id = '${id}'`;
	return database.query(query);
};

const adicionarUsuarioNaTabela = async (email, senha, nome) => {
	const query = {
		text: `INSERT INTO usuarios (email, senha, nome)
	VALUES ($1, $2, $3) RETURNING *`,
		values: [email, senha, nome],
	};
	return database.query(query);
};
module.exports = {
	criarTabelaUsuario,
	adicionarUsuarioNaTabela,
	localizarUsuario,
	localizarId,
};
