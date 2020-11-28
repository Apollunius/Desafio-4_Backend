const { cpf } = require('cpf-cnpj-validator');

const limparDado = (dado) => {
	return dado.replace(/[^\d]/g, ''); // isso aqui é pra usar regex pra retirar qualquer pontuação que possua.
};
const validarCPF = (cpfCliente) => {
	return cpf.isValid(cpfCliente);
};
const organizarCpf = (cpfCliente) => {
	const cpfLimpo = limparDado(cpfCliente);
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

const organizarData = (data) => {
	const dataLimpa = data.replace(/[^\d]/g, '');
	return dataLimpa.replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2/$1');
};
const dataPadrao = (data) => {
	let regra;

	if (data[2] === '/') {
		regra = 1;
	} else if (data[2] === '-') {
		regra = 2;
	} else if (data[4] === '/') {
		regra = 3;
	} else {
		regra = 4;
	}

	if (regra === 1 || regra === 2) {
		const dataLimpa = data.replace(/[^\d]/g, '');
		return dataLimpa.replace(/(\d{2})(\d{2})(\d{4})/, '$3-$2-$1');
	}
	const dataLimpa = data.replace(/[^\d]/g, '');
	return dataLimpa.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
};

const organizarValor = (valor) => {
	const decimal = valor / 100;

	let strString = decimal.toString();

	// substitui separador decimal ponto por virgula
	strString = strString.replace('.', ',');
	// a regex abaixo coloca um ponto a esquerda de cada grupo de 3 dígitos desde que não seja no inicio do numero
	return strString.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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

const htmlParaEmail = (link, texto, boleto, confirmacao) => {
	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
		<head>
		<meta name="viewport" content="width=device-width" />
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>Academy informa</title>
		
		
		<style type="text/css">
		img {
		max-width: 100%;
		}
		body {
		-webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em;
		}
		body {
		background-color: #f6f6f6;
		}
		@media only screen and (max-width: 640px) {
		  body {
			padding: 0 !important;
		  }
		  h1 {
			font-weight: 800 !important; margin: 20px 0 5px !important;
		  }
		  h2 {
			font-weight: 800 !important; margin: 20px 0 5px !important;
		  }
		  h3 {
			font-weight: 800 !important; margin: 20px 0 5px !important;
		  }
		  h4 {
			font-weight: 800 !important; margin: 20px 0 5px !important;
		  }
		  h1 {
			font-size: 22px !important;
		  }
		  h2 {
			font-size: 18px !important;
		  }
		  h3 {
			font-size: 16px !important;
		  }
		  .container {
			padding: 0 !important; width: 100% !important;
		  }
		  .content {
			padding: 0 !important;
		  }
		  .content-wrap {
			padding: 10px !important;
		  }
		  .invoice {
			width: 100% !important;
		  }
		}
		</style>
		</head>
		
		<body itemscope itemtype="http://schema.org/EmailMessage" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6">
		
		<table class="body-wrap" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
				<td class="container" width="600" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;" valign="top">
					<div class="content" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;">
						<table class="main" width="100%" cellpadding="0" cellspacing="0" itemprop="action" itemscope itemtype="http://schema.org/ConfirmAction" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;" bgcolor="#fff"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-wrap" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;" valign="top">
									<meta itemprop="name" content="Confirm Email" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;" /><table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
												${confirmacao}
											</td>
										</tr><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
										</tr><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" itemprop="handler" itemscope itemtype="http://schema.org/HttpActionHandler" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
												<a href=${link} class="btn-primary" itemprop="url" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 5px; text-transform: capitalize; background-color: #348eda; margin: 0; border-color: #348eda; border-style: solid; border-width: 10px 20px;">${texto}</a>
											</td>
										</tr><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" itemprop="handler" itemscope itemtype="http://schema.org/HttpActionHandler" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">${boleto}
											</td>
										</tr><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
												&mdash; Bill & Ted.
											</td>
										</tr></table></td>
							</tr></table><div class="footer" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #999; margin: 0; padding: 20px;">
							<table width="100%" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="aligncenter content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; vertical-align: top; color: #999; text-align: center; margin: 0; padding: 0 0 20px;" align="center" valign="top">Siga <a href="https://twitter.com/billandted" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; color: #999; text-decoration: underline; margin: 0;">@billandted</a> no Twitter.</td>
								</tr></table></div></div>
				</td>
				<td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
			</tr></table></body>
		</html>`;
};
module.exports = {
	validarCPF,
	organizarCpf,
	limparDado,
	organizarTelefone,
	querystring,
	compararNumeros,
	htmlParaEmail,
	organizarData,
	organizarValor,
	dataPadrao,
};
