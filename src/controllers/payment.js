const pagarme = require('../utils/pagarme');
const TabelaCliente = require('../repositories/tabelaClientes');
const TabelaPagamentos = require('../repositories/tabelaPagamentos')
const response = require('../utils/response');

const criarBoleto = async (ctx) => {
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

	let result = await TabelaPagamentos.listarBoletos(offset, idClient);
	result.rows.forEach(element => {
		
		if((Date.now() - element.vencimento.getTime()) > 0) {
			TabelaPagamentos.boletoVencido(element.id);
		}	
	});
	result = await TabelaPagamentos.listarBoletos(offset, idClient);
	
	return response(ctx, 200, { cobrancas: result.rows });
};

const pagarBoleto = async (ctx) => {
	const {id} = ctx.request.body;
	const result = await TabelaPagamentos.buscarBoleto(id);
	const status = result.rows[0].status;
	const vencimento = result.rows[0].vencimento;
	
	if((Date.now() - vencimento.getTime()) <= 0){
		if(status == "AGUARDANDO") {
			const boletoPago = await TabelaPagamentos.pagarBoleto(id);
			return response(ctx, 200, { mensagem: 'Cobrança paga com sucesso' });
		} else {
			return response(ctx, 400, { mensagem: 'Boleto já pago' });
		}
	} else {
		const boletoVencido = await TabelaPagamentos.boletoVencido(id);
		return response(ctx, 400, { mensagem: 'Boleto vencido' });
	}
}

const relatorio = async (ctx) => {
	
}


module.exports = { criarBoleto, querystring, pagarBoleto };
