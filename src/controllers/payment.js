/* eslint-disable no-plusplus */
const pagarme = require('../utils/pagarme');
const TabelaCliente = require('../repositories/tabelaClientes');
const TabelaPagamentos = require('../repositories/tabelaPagamentos');
const Codigo = require('../utils/code');
const response = require('../utils/response');
const { enviarEmail } = require('../utils/email');

/**
 * Gera e envia o boleto(por email) para o cliente selecionado.
 */
const criarBoleto = async (ctx) => {
	const { idDoCliente, descricao, valor, vencimento } = ctx.request.body;
	const vencimentoPadrao = Codigo.dataPadrao(vencimento);
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
			vencimentoPadrao,
			nome,
			cpf
		);
		await TabelaPagamentos.adicionarBoletoNaTabela(
			idDoCliente,
			descricao,
			valor,
			vencimentoPadrao,
			transaction.boleto_url,
			transaction.status,
			transaction.tid
		);
		const vencimentoOrganizado = Codigo.organizarData(vencimento);
		const valorOrganizado = Codigo.organizarValor(valor);
		enviarEmail(
			result.rows[0].email,
			'Boleto gerado com sucesso!',
			Codigo.htmlParaEmail(
				`${transaction.boleto_url}`,
				'Pagar o boleto!',
				`Caso o link acima não funcione, favor realizar o pagamento utilizando o código de barras a seguir: ${transaction.boleto_barcode}`,
				`Olá ${nome}! Gostariamos de informar que ${ctx.state.nome} gerou para você um boleto no valor de R$ ${valorOrganizado} com vencimento: ${vencimentoOrganizado}.`
			)
		);
		return response(ctx, 201, {
			cobranca: {
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

/**
 * Listar os boletos gerado pelo usuário.
 * retornando informações do status, valor, link e vencimento do boleto.
 */
const querystring = async (ctx) => {
	const { offset } = ctx.query;

	const result = await TabelaPagamentos.listarBoletos(offset);
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
	const result2 = await TabelaPagamentos.buscarTodosOsBoletos();
	const numeroDaPagina = offset / 10 + 1;
	const totalBoletos = Math.ceil(result2.rows.length / 10);

	return response(ctx, 200, {
		paginaAtual: numeroDaPagina,
		totalDePaginas: totalBoletos,
		cobrancas: cobrancasAtualizadas,
	});
};

/**
 * Muda o status do boleto para "pago", passando o idDoBoleto no body.
 * Caso o boleto informado já esteja pago ou vencido, será informado.
 */
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

/**
 * Gera um relatório com informações sobre os clientes do usuário e os boletos gerados pelo usuário.
 * retornando também todo o valor pago pelos cliente para o usuário.
 */
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
