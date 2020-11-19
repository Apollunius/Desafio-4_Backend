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
		idUser INT NOT NULL
	)`,
	3: `CREATE TABLE IF NOT EXISTS boletos (
		id SERIAL PRIMARY KEY,
		valor INT,
		vencimento DATE,
		cliente INT,
		descricao TEXT,
		link TEXT,
		dataPagamento DATE
	)`,
};

const drop = async (nomeTabela) => {
	if (nomeTabela) {
		await database.query(`DROP TABLE ${nomeTabela}`);
		console.log('Tabela dropada!');
	}
};
/**
 * Função que define qual query existente em schema, com o numero respectivo
 * eu vou rodar. Se eu não passar um número, então todas as queries de schema
 * uma a uma serão rodadas.
 */
const up = async (numeroSchema = null) => {
	if (!numeroSchema) {
		for (const value in schema) {
			await database.query({ text: schema[value] });
		}
	} else {
		await database.query({ text: schema[numeroSchema] });
	}
	console.log('Migração executada!');
};

up();
// drop('usuarios');
// drop('clientes');
// drop('boletos');
