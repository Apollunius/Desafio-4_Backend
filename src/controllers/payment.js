const pagarme = require('../utils/pagarme');
const TabelaCliente = require('../repositories/tabelaClientes');
const response = require('../utils/response');

const payment = async (ctx) => {
	const {
		idDoCliente,
		descricao,
		valor = 100,
		vencimento,
	} = ctx.request.body;
	const result = await TabelaCliente.localizarIdCliente(idDoCliente);
	const { nome, cpf } = result.rows[0];
	if (valor >= 100) {
		const transaction = await pagarme.pay(
			valor,
			descricao,
			vencimento,
			nome,
			cpf
		);

		return response(ctx, 201, {
			cobranca: {
				idDoCliente,
				descricao,
				valor,
				vencimento,
				linkDoBoleto: transaction.boleto_url,
				status: transaction.status,
			},
		});
	}
	return response(ctx, 400, { mensagem: 'Mal formatado.' });
};

module.exports = { payment };
