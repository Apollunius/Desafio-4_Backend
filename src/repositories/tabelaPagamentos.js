const database = require('../utils/database');

const adicionarBoletoNaTabela = async (
	idDoCliente,
	descricao,
	valor,
	vencimento,
	link,
	status,
	transactionId
) => {
	const query = {
		text: `INSERT INTO boletos (idDoCliente, descricao, valor, vencimento, link, status, transactionId)
	VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
		values: [
			idDoCliente,
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

const listarBoletos = async (offset, idDoCliente) => {
	const query = `SELECT * FROM boletos WHERE idDoCliente = '${idDoCliente}' ORDER BY id ASC LIMIT 10 OFFSET ${offset}`;
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
	const query = `SELECT * FROM boletos WHERE id = '${idCobranca}' ORDER BY id ASC`;
	return database.query(query);
};

const buscarTodosOsBoletos = async () => {
	const query = `SELECT * FROM boletos ORDER BY id ASC`;
	return database.query(query);
};
const relatorio = async (idUser) => {
	const query = `SELECT TABELA2.idDoCliente, TABELA2.valor, TABELA2.vencimento, TABELA2.status FROM (SELECT * FROM clientes WHERE idUser = '${idUser}') AS TABELA1 INNER JOIN (SELECT * FROM boletos) AS TABELA2 ON TABELA1.id = TABELA2.idDoCliente`;

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
