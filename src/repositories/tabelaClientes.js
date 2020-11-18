const database = require('../utils/database');

const criarTabelaClientes = async () => {
	const query = `CREATE TABLE IF NOT EXISTS clientes (
		id SERIAL,
		nome TEXT,
		cpf VARCHAR(14),
		email VARCHAR(50),
		tel VARCHAR(14),
		idUser TEXT
	)`;

	return database.query(query);
};

/**
 * Função para localizar o cliente pelo CPF
 */
const localizarCPF = async (cpf) => {
	const query = `SELECT * FROM clientes WHERE cpf = '${cpf}'`;
	return database.query(query);
};

const adicionarClienteNaTabela = async (nome, cpf, email, tel, idUser) => {
	const query = {
		text: `INSERT INTO clientes (nome, cpf, email, tel, iduser)
	VALUES ($1, $2, $3, $4, $5) RETURNING *`,
		values: [nome, cpf, email, tel, idUser],
	};
	return database.query(query);
};

module.exports = {
	criarTabelaClientes,
	adicionarClienteNaTabela,
	localizarCPF,
};
