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
	const query = `SELECT * FROM boletos WHERE idClient = '${idClient}' LIMIT 10 OFFSET ${offset}`;
	return database.query(query);
};

const pagarBoleto = async (idCobranca) => {
	const query = `UPDATE boletos SET status = 'PAGO' WHERE id = '${idCobranca}' RETURNING *`
	return database.query(query);
}
const boletoVencido = async (idCobranca) => {
	const query = `UPDATE boletos SET status = 'VENCIDO' WHERE id = '${idCobranca}' RETURNING *`
	return database.query(query);
}

const buscarBoleto = async (idCobranca) => {
	const query = `SELECT * FROM boletos WHERE id = '${idCobranca}'`;
	return database.query(query);
}


module.exports = {
	adicionarBoletoNaTabela,
	listarBoletos,
	pagarBoleto,
	buscarBoleto,
	boletoVencido
};