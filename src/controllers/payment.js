const pagarme = require('../utils/pagarme');
const TabelaCliente = require('../repositories/tabelaClientes');
const TabelaPagamentos = require('../repositories/tabelaPagamentos')
const response = require('../utils/response');

const payment = async (ctx) => {
	const {
		idClient,
		descricao,
		valor,
		vencimento,
	} = ctx.request.body;
	const result = await TabelaCliente.localizarIdCliente(idClient);
	const { nome, cpf } = result.rows[0];
	if (valor >= 100) {
		const transaction = await pagarme.pay(
			valor,
			descricao,
			vencimento,
			nome,
			cpf
		);
		await TabelaPagamentos.adicionarBoletoNaTabela(
			idClient,
			descricao,
			valor,
			vencimento,
			transaction.boleto_url,
		);
		return response(ctx, 201, {
			cobranca: {
				idClient,
				descricao,
				valor,
				vencimento,
				linkDoBoleto: transaction.boleto_url,
				status: "AGUARDANDO"
			},
		});
	}
	return response(ctx, 400, { mensagem: 'Mal formatado.' });
};

const querystring = async (ctx) => {
	const { offset, idClient } = ctx.query;
	const result = await TabelaPagamentos.listarBoletos(offset, idClient);
	return response(ctx, 200, { cobrancas: result.rows });
};

module.exports = { payment, querystring };
