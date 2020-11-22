const TabelaClientes = require('../repositories/tabelaClientes');
const TabelaUsuarios = require('../repositories/tabelaUsuarios');
const Codigo = require('../utils/code');
const response = require('../utils/response');

const adicionarCliente = async (ctx) => {
	const {
		nome = null,
		cpf = null,
		email = null,
		tel = null,
		idUsuario = null,
	} = ctx.request.body;
	if (!nome || !cpf || !email || !tel || !idUsuario) {
		return response(ctx, 400, { mensagem: 'Mal formatado' });
	}
	const verificarCliente = await TabelaClientes.localizarCPF(cpf);
	if (verificarCliente.rows.length > 0) {
		const cpfCliente = verificarCliente.rows[0].cpf;
		if (cpfCliente === cpf) {
			return response(ctx, 401, {
				mensagem: 'Esse cliente já está cadastrado.',
			});
		}
	}
	const resultDados2 = await TabelaUsuarios.localizarId(idUsuario); // Função para testes iniciais, será removido após a montagem do front
	if (resultDados2.rows.length > 0) {
		const idUser = resultDados2.rows[0].id;
		if (idUsuario !== idUser.toString()) {
			return response(ctx, 400, { mensagem: 'Mal formatado' });
		}
	}
	const cpfLimpo = Codigo.limparCpf(cpf);
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

const atualizarCliente = async (ctx) => {
	const {
		id = null,
		nome = null,
		cpf = null,
		email = null,
		tel = null,
	} = ctx.request.body;
	if (!nome || !cpf || !email || !tel || !id) {
		return response(ctx, 400, { mensagem: 'Mal formatado' });
	}
	const verificarCliente = await TabelaClientes.localizarIdClientes(id);
	if (verificarCliente.rows.length === 0) {
		return response(ctx, 400, { mensagem: 'Mal formatado' });
	}
	const cpfLimpo = Codigo.limparCpf(cpf);
	const result = await TabelaClientes.atualizarCliente(
		id,
		nome,
		cpfLimpo,
		email,
		tel
	);
	const cpfEditado = Codigo.montarCpf(result[0].cpf);
	return response(ctx, 200, {
		id: result[0].id,
		nome: result[0].nome,
		cpf: cpfEditado,
		email: result[0].email,
		tel: result[0].tel,
	});
};
const querystring = async (ctx) => {
	const { offset } = ctx.query;
	if (ctx.querystring.includes('busca')) {
		const { busca } = ctx.query;
		const result = await TabelaClientes.listarClientesPorBusca(
			busca,
			offset
		);
		return response(ctx, 200, { clientes: result.rows });
	}
	const result = await TabelaClientes.listarClientes(offset);
	return response(ctx, 200, { clientes: result.rows });
};
module.exports = { adicionarCliente, atualizarCliente, querystring };
