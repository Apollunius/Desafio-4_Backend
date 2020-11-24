const database = require('../utils/database');

const adicionarBoletoNaTabela = async (idClient, descricao, valor, vencimento, link) => {
	const query = {
		text: `INSERT INTO boletos (idClient, descricao, valor, vencimento, link)
	VALUES ($1, $2, $3, $4, $5) RETURNING *`,
		values: [idClient, descricao, valor, vencimento, link],
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