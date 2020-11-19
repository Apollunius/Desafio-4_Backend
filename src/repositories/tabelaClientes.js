const database = require('../utils/database');

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
	adicionarClienteNaTabela,
	localizarCPF,
};
