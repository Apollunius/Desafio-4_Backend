const limparDado = (dado) => {
	return dado.replace(/[^\d]/g, ''); // isso aqui é pra usar regex pra retirar qualquer pontuação que possua.
};

const organizarCpf = (cpf) => {
	const cpfLimpo = limparDado(cpf);
	return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'); // isso aqui é pra formatar o cpf no padrão xxx.xxx.xxx-xx.
};

const organizarTelefone = (telefone) => {
	const telefoneLimpo = limparDado(telefone);
	if (telefoneLimpo.length === 13) {
		return telefoneLimpo.replace(
			/(\d{2})(\d{2})(\d{5})(\d{4})/,
			'+$1 $2 $3-$4'
		);
	}
	if (telefoneLimpo.length === 12) {
		return telefoneLimpo.replace(
			/(\d{2})(\d{2})(\d{4})(\d{4})/,
			'+$1 $2 $3-$4'
		);
	}
	if (telefoneLimpo.length === 11) {
		return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '$1 $2-$3');
	}
	if (telefoneLimpo.length === 10) {
		return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2-$3');
	}
};
const querystring = (clientes, boletos) => {
	const dadosDePagamentoDoCliente = [];

	clientes.rows.forEach((cliente, index) => {
		let cobrancasFeitas = 0;
		let cobrancasRecebidas = 0;
		let estaInadimplente = false;
		boletos.rows.forEach((boleto) => {
			if (cliente.id === boleto.iddocliente) {
				cobrancasFeitas += boleto.valor;

				if (boleto.status === 'paid' || boleto.status === 'PAGO') {
					cobrancasRecebidas += boleto.valor;
				}
				if (
					boleto.status === 'VENCIDO' ||
					Date.now() - boleto.vencimento.getTime() > 0
				) {
					estaInadimplente = true;
				}
			}
		});
		dadosDePagamentoDoCliente[index] = {
			nome: cliente.nome,
			id: cliente.id,
			email: cliente.email,
			cobrancasFeitas,
			cobrancasRecebidas,
			estaInadimplente,
		};
	});
	return dadosDePagamentoDoCliente;
};

const compararNumeros = (a, b) => {
	return a.iddocliente - b.iddocliente;
};
module.exports = {
	organizarCpf,
	limparDado,
	organizarTelefone,
	querystring,
	compararNumeros,
};
