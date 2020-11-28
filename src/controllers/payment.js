/* eslint-disable no-plusplus */
const pagarme = require('../utils/pagarme');
const TabelaCliente = require('../repositories/tabelaClientes');
const TabelaPagamentos = require('../repositories/tabelaPagamentos');
const Codigo = require('../utils/code');
const response = require('../utils/response');

const criarBoleto = async (ctx) => {
	const { idDoCliente, descricao, valor, vencimento } = ctx.request.body;
	const { idUsuario } = ctx.state;

	const result = await TabelaCliente.localizarIdCliente(
		idDoCliente,
		idUsuario
	);
	if (result.rows.length === 0) {
		return response(ctx, 403, { mensagem: 'Não autorizado' });
	}
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
			idDoCliente,
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
				idDoCliente,
				descricao,
				valor,
				vencimento,
				linkDoBoleto: transaction.boleto_url,
				status: 'AGUARDANDO',
			},
		});
	}
	return response(ctx, 400, { mensagem: 'Mal formatado.' });
};

const querystring = async (ctx) => {
	const { offset, idDoCliente } = ctx.query;

	const result = await TabelaPagamentos.listarBoletos(offset, idDoCliente);
	const cobrancasAtualizadas = [];
	result.rows.forEach((element, index) => {
		const { transactionid, ...rest } = element;
		cobrancasAtualizadas.push(rest);

		if (element.status === 'waiting_payment') {
			cobrancasAtualizadas[index].status = 'AGUARDANDO';
		} else if (element.status === 'paid') {
			cobrancasAtualizadas[index].status = 'PAGO';
		} else {
			cobrancasAtualizadas[index].status = 'VENCIDO';
		}
		if (Date.now() - element.vencimento.getTime() > 0) {
			TabelaPagamentos.boletoVencido(element.id);
		}
	});

	return response(ctx, 200, { cobrancas: cobrancasAtualizadas });
};

const pagarBoleto = async (ctx) => {
	const { idDaCobranca } = ctx.request.body;
	const result = await TabelaPagamentos.buscarBoleto(idDaCobranca);
	if (result) {
		if (Date.now() - result.rows[0].vencimento.getTime() <= 0) {
			if (result.rows[0].status === 'waiting_payment') {
				const pagamento = await pagarme.pagarBoleto(result);
				if (pagamento.status === 'paid') {
					await TabelaPagamentos.pagarBoleto(idDaCobranca);
					return response(ctx, 200, {
						mensagem: 'Cobrança paga com sucesso',
					});
				}
			} else {
				return response(ctx, 200, { mensagem: 'Cobrança já paga' });
			}
		} else {
			await TabelaPagamentos.boletoVencido(idDaCobranca);
			return response(ctx, 200, { mensagem: 'Cobrança vencido' });
		}
	}
	return response(ctx, 400, { mensagem: 'Mal formatado' });
};

const gerarRelatorio = async (ctx) => {
	const { idUsuario } = ctx.state;
	const result = await TabelaPagamentos.relatorio(idUsuario);
	const relatorio = {
		qtdClientesAdimplentes: 0,
		qtdClientesInadimplentes: 0,
		qtdCobrancasPrevistas: 0,
		qtdCobrancasPagas: 0,
		qtdCobrancasVencidas: 0,
		saldoEmConta: 0,
	};
	let clienteJaVerificado = null;
	let statusJaVerificado = [];
	result.rows.sort(Codigo.compararNumeros);

	result.rows.forEach((elemento) => {
		if (clienteJaVerificado !== elemento.idDoCliente) {
			statusJaVerificado = [];
		}
		if (!statusJaVerificado.includes(elemento.status)) {
			clienteJaVerificado = null;
		}
		if (elemento.status === 'waiting_payment') {
			relatorio.qtdCobrancasPrevistas++;
			if (
				clienteJaVerificado !== elemento.idDoCliente ||
				!statusJaVerificado.includes(elemento.status)
			) {
				relatorio.qtdClientesAdimplentes++;
				clienteJaVerificado = elemento.idDoCliente;
				statusJaVerificado.push(elemento.status);
			}
		} else if (elemento.status === 'paid') {
			relatorio.saldoEmConta += elemento.valor;
			relatorio.qtdCobrancasPagas++;
			if (
				clienteJaVerificado !== elemento.idDoCliente ||
				!statusJaVerificado.includes(elemento.status)
			) {
				relatorio.qtdClientesAdimplentes++;
				clienteJaVerificado = elemento.idDoCliente;
				statusJaVerificado.push(elemento.status);
			}
		} else if (
			elemento.status === 'VENCIDO' ||
			Date.now() - elemento.vencimento.getTime() > 0
		) {
			relatorio.qtdCobrancasVencidas++;
			if (
				clienteJaVerificado !== elemento.idDoCliente ||
				!statusJaVerificado.includes(elemento.status)
			) {
				relatorio.qtdClientesInadimplentes++;
				clienteJaVerificado = elemento.idDoCliente;
				statusJaVerificado.push(elemento.status);
			}
		}
	});

	return response(ctx, 200, { relatorio });
};

module.exports = { criarBoleto, querystring, pagarBoleto, gerarRelatorio };
