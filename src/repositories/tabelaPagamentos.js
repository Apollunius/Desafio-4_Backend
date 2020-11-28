const database = require('../utils/database');

/**
 * Query para adicionar o boleto criado pelo usuário para um cliente específico na tabela do banco de dados.
 */
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

/**
 * Query que lista todos os boletos dos clientes do usuário.
 */
const listarBoletos = async (offset, idDoCliente) => {
	const query = `SELECT * FROM boletos WHERE idDoCliente = '${idDoCliente}' ORDER BY id ASC LIMIT 10 OFFSET ${offset}`;
	return database.query(query);
};

/**
 * Query que muda o status do boleto para 'pago'
 */
const pagarBoleto = async (idCobranca) => {
	const query = `UPDATE boletos SET status = 'paid' WHERE id = '${idCobranca}' RETURNING *`;
	return database.query(query);
};

/**
 * Query que muda o status do boleto para 'vencido'
 */
const boletoVencido = async (idCobranca) => {
	const query = `UPDATE boletos SET status = 'VENCIDO' WHERE id = '${idCobranca}' RETURNING *`;
	return database.query(query);
};

/**
 * Query para fazer busca de um boleto pelo id da cobrança.
 */
const buscarBoleto = async (idCobranca) => {
	const query = `SELECT * FROM boletos WHERE id = '${idCobranca}' ORDER BY id ASC`;
	return database.query(query);
};

/**
 * Query que retorna todos os boletos da tabela do banco de dados.
 */
const buscarTodosOsBoletos = async () => {
	const query = `SELECT * FROM boletos ORDER BY id ASC`;
	return database.query(query);
};

/**
 * Query que retorna todos os dados necessários para o relatório do usuário.
 */
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
