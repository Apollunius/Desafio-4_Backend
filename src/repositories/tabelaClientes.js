const database = require('../utils/database');

/**
 * Função para localizar o cliente pelo CPF
 */
const localizarCPF = async (cpf) => {
	const query = `SELECT * FROM clientes WHERE cpf = '${cpf}'`;
	return database.query(query);
};

const localizarIdCliente = async (id) => {
	const query = `SELECT * FROM clientes WHERE id = '${id}'`;
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

const atualizarCliente = async (id, nome, cpf, email, tel) => {
	const query = `UPDATE clientes SET nome = '${nome}', cpf = '${cpf}', email = '${email}', tel = '${tel}' 
		WHERE id = ${id} RETURNING *`;
	return database.query(query);
};

const listarClientes = async (offset) => {
	const query = `SELECT * FROM clientes LIMIT 10 OFFSET ${offset}`;
	return database.query(query);
};

const listarClientesPorBusca = async (string, offset) => {
	const query = `SELECT * FROM clientes WHERE (nome LIKE '%${string}%' OR email = '${string}' OR cpf = '${string}') LIMIT 10 OFFSET ${offset}`;
	return database.query(query);
};

module.exports = {
	adicionarClienteNaTabela,
	localizarCPF,
	localizarIdCliente,
	atualizarCliente,
	listarClientes,
	listarClientesPorBusca,
};
