const TabelaClientes = require('../repositories/tabelaClientes');
const TabelaPagamentos = require('../repositories/tabelaPagamentos');
const Codigo = require('../utils/code');
const response = require('../utils/response');

/**
 * Adiciona o cliente do usuário na tabela de clientes.
 */
const adicionarCliente = async (ctx) => {
	const {
		nome = null,
		cpf = null,
		email = null,
		tel = null,
	} = ctx.request.body;
	const { idUsuario } = ctx.state;

	if (!nome || !cpf || !email || !tel || !idUsuario) {
		return response(ctx, 400, { mensagem: 'Mal formatado' });
	}
	const cpfLimpo = Codigo.limparDado(cpf);
	const verificarCliente = await TabelaClientes.localizarCPF(
		cpfLimpo,
		idUsuario
	);

	if (verificarCliente.rows.length > 0) {
		if (verificarCliente.rows[0].cpf === cpfLimpo) {
			return response(ctx, 401, {
				mensagem: 'Cpf já cadastrado',
			});
		}
	}
	const result = await TabelaClientes.adicionarClienteNaTabela(
		nome,
		cpfLimpo,
		email,
		tel,
		idUsuario
	);
	const { id } = await result.rows.shift();
	return response(ctx, 201, { id: `${id}` });
};

/**
 * Atualizar os dados do cliente na tabela clientes
 */
const atualizarCliente = async (ctx) => {
	const {
		id = null,
		nome = null,
		cpf = null,
		email = null,
		tel = null,
	} = ctx.request.body;
	const { idUsuario } = ctx.state;
	if (!nome || !cpf || !email || !tel || !id) {
		return response(ctx, 400, { mensagem: 'Mal formatado' });
	}
	const verificarCliente = await TabelaClientes.localizarIdCliente(
		id,
		idUsuario
	);
	if (verificarCliente.rows.length === 0) {
		return response(ctx, 400, { mensagem: 'Mal formatado' });
	}

	const cpfLimpo = Codigo.limparDado(cpf);
	const telefoneLimpo = Codigo.limparDado(tel);

	const result = await TabelaClientes.atualizarCliente(
		id,
		nome.toLowerCase().trim(),
		cpfLimpo,
		email.toLowerCase().trim(),
		telefoneLimpo,
		idUsuario
	);
	const cpfEditado = Codigo.organizarCpf(cpfLimpo);
	const telefoneEditado = Codigo.organizarTelefone(telefoneLimpo);
	return response(ctx, 200, {
		id: result.rows[0].id,
		nome: result.rows[0].nome,
		cpf: cpfEditado,
		email: result.rows[0].email,
		tel: telefoneEditado,
	});
};

/**
 * Buscar ou listar clientes do usuário.
 * caso tenha não tenha nenhum conteúdo na busca, ele vai agir como listagem dos clientes.
 * caso tenha algum conteudo na querystring, ele iria buscar por nome, email ou cpf do cliente conforme solicitado na query.
 */
const querystring = async (ctx) => {
	const { idUsuario } = ctx.state;
	const { offset } = ctx.query;
	if (ctx.querystring.includes('busca')) {
		const { busca } = ctx.query;
		const clientes = await TabelaClientes.listarClientesPorBusca(
			busca,
			offset,
			idUsuario
		);
		const boletos = await TabelaPagamentos.buscarTodosOsBoletos();
		const result = await TabelaClientes.listarTodosClientesPorBusca(
			busca,
			idUsuario
		);
		const totalClientes = Math.ceil(result.rows.length / 10);
		const numeroDaPagina = offset / 10 + 1;

		const dadosDePagamentoDoCliente = Codigo.querystring(clientes, boletos);
		return response(ctx, 200, {
			paginaAtual: numeroDaPagina,
			totalDePaginas: totalClientes,
			clientes: dadosDePagamentoDoCliente,
		});
	}
	const clientes = await TabelaClientes.listarClientes(offset, idUsuario);
	const boletos = await TabelaPagamentos.buscarTodosOsBoletos();
	const result = await TabelaClientes.listarTodosClientes(idUsuario);
	const totalClientes = Math.ceil(result.rows.length / 10);
	const numeroDaPagina = offset / 10 + 1;

	const dadosDePagamentoDoCliente = Codigo.querystring(clientes, boletos);
	return response(ctx, 200, {
		paginaAtual: numeroDaPagina,
		totalDePaginas: totalClientes,
		clientes: dadosDePagamentoDoCliente,
	});
};
module.exports = { adicionarCliente, atualizarCliente, querystring };
