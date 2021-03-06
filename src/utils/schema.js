/* eslint-disable guard-for-in */
/* eslint-disable no-await-in-loop */
const database = require('./database');

const schema = {
	1: `CREATE TABLE IF NOT EXISTS usuarios (
		id SERIAL PRIMARY KEY,
		email VARCHAR(50) NOT NULL,
		senha TEXT NOT NULL,
		nome TEXT NOT NULL,
		deletado BOOL DEFAULT FALSE
	)`,
	2: `CREATE TABLE IF NOT EXISTS clientes (
		id SERIAL PRIMARY KEY,
		nome TEXT NOT NULL,
		cpf VARCHAR(14) NOT NULL,
		email VARCHAR(50) NOT NULL,
		tel VARCHAR(14) NOT NULL,
		idUser INT NOT NULL,
		estaInadimplente BOOL DEFAULT FALSE
	)`,
	3: `CREATE TABLE IF NOT EXISTS boletos (
		id SERIAL PRIMARY KEY,
		idDoCliente INT NOT NULL,
		idUser INT NOT NULL,
		descricao TEXT NOT NULL,
		valor INT NOT NULL,
		vencimento DATE NOT NULL,
		link TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'AGUARDANDO',
		transactionId TEXT NOT NULL
	)`,
};

/**
 * Essa função dropa a tabela que estiver como argumento
 */
const drop = async (nomeTabela) => {
	if (nomeTabela) {
		await database.query(`DROP TABLE ${nomeTabela}`);
		console.log('Tabela dropada!');
	}
};
/**
 * Função que define a criação de tabela,
 * seja individual (pelo numero do schema no argumento da função)
 * como todas de vez(sem colocar nenhum argumento na função.)
 */
const up = async (numeroSchema = null) => {
	if (!numeroSchema) {
		// eslint-disable-next-line no-restricted-syntax
		for (const value in schema) {
			await database.query({ text: schema[value] });
		}
	} else {
		await database.query({ text: schema[numeroSchema] });
	}
	console.log('Migração executada!');
};

// Comentar as funções que não irá usar.
up();
// drop('usuarios');
// drop('clientes');
// drop('boletos');
