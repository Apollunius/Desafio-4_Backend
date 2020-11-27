const database = require('../utils/database');

const adicionarBoletoNaTabela = async (
	idClient,
	descricao,
	valor,
	vencimento,
	link,
	status,
	transactionId
) => {
	const query = {
		text: `INSERT INTO boletos (idClient, descricao, valor, vencimento, link, status, transactionId)
	VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
		values: [
			idClient,
			descricao,
			valor,
			vencimento,
			link,
			status,
			transactionId,
		],
	};
	return database.query(query);
};

const listarBoletos = async (offset, idClient) => {
	const query = `SELECT * FROM boletos WHERE idClient = '${idClient}' LIMIT 10 OFFSET ${offset}`;
	return database.query(query);
};

const pagarBoleto = async (idCobranca) => {
	const query = `UPDATE boletos SET status = 'paid' WHERE id = '${idCobranca}' RETURNING *`;
	return database.query(query);
};
const boletoVencido = async (idCobranca) => {
	const query = `UPDATE boletos SET status = 'VENCIDO' WHERE id = '${idCobranca}' RETURNING *`;
	return database.query(query);
};

const buscarBoleto = async (idCobranca) => {
	const query = `SELECT * FROM boletos WHERE id = '${idCobranca}'`;
	return database.query(query);
};

const buscarTodosOsBoletos = async () => {
	const query = `SELECT * FROM boletos`;
	return database.query(query);
};
const relatorio = async (idUser) => {
	const query = `SELECT TABELA2.idClient, TABELA2.valor, TABELA2.vencimento, TABELA2.status FROM (SELECT * FROM clientes WHERE idUser = '${idUser}') AS TABELA1 INNER JOIN (SELECT * FROM boletos) AS TABELA2 ON TABELA1.id = TABELA2.idClient`;

	return database.query(query);
};

module.exports = {
	adicionarBoletoNaTabela,
	listarBoletos,
	pagarBoleto,
	buscarBoleto,
	boletoVencido,
	buscarTodosOsBoletos,
	relatorio,
};
