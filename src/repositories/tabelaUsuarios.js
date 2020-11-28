const database = require('../utils/database');

/**
 * Query para identificar se já existe algum email na hora de criar usuário.
 */
const localizarUsuario = async (email) => {
	const query = `SELECT * FROM usuarios WHERE email = '${email}'`;
	return database.query(query);
};

/**
 * Query para identificar se já existe usuário com o id específico para criar o usuário.
 */
const localizarId = async (id) => {
	const query = `SELECT * FROM usuarios WHERE id = '${id}'`;
	return database.query(query);
};

/**
 * Query que adiciona todos os dados do usuário no momento da criação na tabela usuários.
 */
const adicionarUsuarioNaTabela = async (email, senha, nome) => {
	const query = {
		text: `INSERT INTO usuarios (email, senha, nome)
	VALUES ($1, $2, $3) RETURNING *`,
		values: [email, senha, nome],
	};
	return database.query(query);
};

module.exports = {
	adicionarUsuarioNaTabela,
	localizarUsuario,
	localizarId,
};
