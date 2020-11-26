const pagarme = require('../utils/pagarme');
const TabelaCliente = require('../repositories/tabelaClientes');
const TabelaPagamentos = require('../repositories/tabelaPagamentos')
const Codigo = require('../utils/code')
const response = require('../utils/response');

const criarBoleto = async (ctx) => {
	const {
		idClient,
		descricao,
		valor,
		vencimento,
	} = ctx.request.body;
	const { idUsuario } = ctx.state;

	const result = await TabelaCliente.localizarIdCliente(idClient, idUsuario);
	const { nome, cpf } = result.rows[0];
	if (valor >= 100) {
		const transaction = await pagarme.gerarBoleto(
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
			transaction.status,
			transaction.tid
		);
		return response(ctx, 201, {
			cobranca: {
				id: transaction.tid,
				idClient,
				descricao,
				valor,
				vencimento,
				linkDoBoleto: transaction.boleto_url,
				status: "AGUARDANDO",
			},
		});
	}
	return response(ctx, 400, { mensagem: 'Mal formatado.' });
};

const querystring = async (ctx) => {
	const { offset, idClient } = ctx.query;

	const result = await TabelaPagamentos.listarBoletos(offset, idClient);
	const cobrancasAtualizadas = [];
	result.rows.forEach((element, index)  => {
		const {transactionid, ...rest} = element
		cobrancasAtualizadas.push(rest)
		
		if(element.status == 'waiting_payment') {
			cobrancasAtualizadas[index].status = 'AGUARDANDO'
		} else if (element.status == 'paid') {
			cobrancasAtualizadas[index].status = "PAGO"
		} else {
			cobrancasAtualizadas[index].status = 'VENCIDO'
		}
		if((Date.now() - element.vencimento.getTime()) > 0) {
			TabelaPagamentos.boletoVencido(element.id);
		}	
	});
	
	return response(ctx, 200, { cobrancas: cobrancasAtualizadas });
};

const pagarBoleto = async (ctx) => {
	const {id} = ctx.request.body;
	const result = await TabelaPagamentos.buscarBoleto(id);
	if (!result) {
		return response(ctx, 400, { mensagem: 'Mal formatado' });
	}
	if((Date.now() - result.rows[0].vencimento.getTime()) <= 0) {
		if(result.rows[0].status === 'waiting_payment'){
			const pagamento = await pagarme.pagarBoleto(id);
			if(pagamento.status === "paid") {
				await TabelaPagamentos.pagarBoleto(id)
				return response(ctx, 200, { mensagem: 'Cobrança paga com sucesso' });
			}
		} else {
			return response(ctx, 200, { mensagem: 'Cobrança já paga' });
		}

	} else {
		await TabelaPagamentos.boletoVencido(id);
		return response(ctx, 200, { mensagem: 'Cobrança vencido' });
	}
	
}

const relatorio = async (ctx) => {
	const { idUsuario } = ctx.state;
	const result = await TabelaPagamentos.relatorio(idUsuario)
	let relatorio = {
		qtdClientesAdimplentes: 0,
		qtdClientesInadimplentes: 0,
		qtdCobrancasPrevistas: 0,
		qtdCobrancasPagas: 0,
		qtdCobrancasVencidas: 0,
		saldoEmConta: 0
	}
	let clienteJaVerificado = null;
	let statusJaVerificado = [];
	result.rows.sort(Codigo.compararNumeros)

	result.rows.forEach((elemento, index) => {
		if(clienteJaVerificado != elemento.idClient) {
			statusJaVerificado = []
		}
		if(!statusJaVerificado.includes(elemento.status)) {
			clienteJaVerificado = null;
		}
		if(elemento.status == 'waiting_payment') {
			relatorio.qtdCobrancasPrevistas++;
			if(clienteJaVerificado != elemento.idClient || !statusJaVerificado.includes(elemento.status)){
				relatorio.qtdClientesAdimplentes++;
				clienteJaVerificado = elemento.idClient;
				statusJaVerificado.push(elemento.status);	
			}
		} else if(elemento.status == 'paid'){
			relatorio.saldoEmConta += elemento.valor;
			relatorio.qtdCobrancasPagas++
			if(clienteJaVerificado != elemento.idClient || !statusJaVerificado.includes(elemento.status)){
				relatorio.qtdClientesAdimplentes++;
				clienteJaVerificado = elemento.idClient;
				statusJaVerificado.push(elemento.status);	
			}
		} else if(elemento.status == 'VENCIDO' || ((Date.now() - elemento.vencimento.getTime()) > 0)){
			relatorio.qtdCobrancasVencidas++
			if(clienteJaVerificado != elemento.idClient || !statusJaVerificado.includes(elemento.status)){
				relatorio.qtdClientesInadimplentes++;
				clienteJaVerificado = elemento.idClient;
				statusJaVerificado.push(elemento.status);	
			}
		}

	})
	
	return response(ctx, 200, {relatorio: relatorio});
}


module.exports = { criarBoleto, querystring, pagarBoleto, relatorio };
