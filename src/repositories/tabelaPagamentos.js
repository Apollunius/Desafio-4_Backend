const database = require('../utils/database');

const adicionarBoletoNaTabela = async (idClient, valor, vencimento, descricao, link) => {
	const query = {
		text: `INSERT INTO boletos (idClient, valor, vencimento, descricao, link)
	VALUES ($1, $2, $3, $4, $5) RETURNING *`,
		values: [idClient, valor, vencimento, descricao, link],
	};
	return database.query(query);
};

const listarBoletos = async (offset, idClient) => {
	const query = `SELECT * FROM boletos WHERE idClient = ${idClient} LIMIT 10 OFFSET ${offset}`;
	return database.query(query);
};

module.exports = {
	adicionarBoletoNaTabela,
	listarBoletos
};