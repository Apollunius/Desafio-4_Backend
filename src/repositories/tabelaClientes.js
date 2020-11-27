const database = require('../utils/database');

/**
 * Função para localizar o cliente pelo CPF
 */
const localizarCPF = async (cpf, idUser) => {
	const query = `SELECT * FROM clientes WHERE (cpf = '${cpf}' AND idUser = '${idUser}') ORDER BY id ASC`;
	return database.query(query);
};

const localizarIdCliente = async (id, idUser) => {
	const query = `SELECT * FROM clientes WHERE (id = '${id}' AND idUser = '${idUser}') ORDER BY id ASC`;
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

const atualizarCliente = async (id, nome, cpf, email, tel, idUser) => {
	const query = `UPDATE clientes SET nome = '${nome}', cpf = '${cpf}', email = '${email}', tel = '${tel}' 
		WHERE (id = '${id}' AND idUser = '${idUser}') RETURNING *`;
	return database.query(query);
};

const listarClientes = async (offset, idUser) => {
	const query = `SELECT * FROM clientes WHERE idUser = '${idUser}'  ORDER BY id ASC LIMIT 10 OFFSET ${offset}`;
	return database.query(query);
};

const listarClientesPorBusca = async (string, offset, idUser) => {
	const query = `SELECT * FROM clientes WHERE ((nome ILIKE '%${string}%' OR email = '${string}' OR cpf = '${string}') AND idUser = ${idUser}) ORDER BY id ASC LIMIT 10 OFFSET ${offset}`;
	return database.query(query);
};
const listarTodosClientes = async (idUser) => {
	const query = `SELECT * FROM clientes WHERE idUser = ${idUser} ORDER BY id ASC`;
	return database.query(query);
};
const listarTodosClientesPorBusca = async (string, idUser) => {
	const query = `SELECT * FROM clientes WHERE ((nome ILIKE '%${string}%' OR email = '${string}' OR cpf = '${string}') AND idUser = ${idUser}) ORDER BY id ASC`;
	return database.query(query);
};

module.exports = {
	adicionarClienteNaTabela,
	localizarCPF,
	localizarIdCliente,
	atualizarCliente,
	listarClientes,
	listarClientesPorBusca,
	listarTodosClientes,
	listarTodosClientesPorBusca,
};
