const tabelaClientes = require('../repositories/tabelaClientes');
const TabelaClientes = require('../repositories/tabelaClientes');
const TabelaUsuarios = require('../repositories/tabelaUsuarios');
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
	const resultDados = await TabelaClientes.localizarCPF(cpf);
	if (resultDados.rows.length > 0) {
		const cpfCliente = resultDados.rows[0].cpf;
		if (cpfCliente === cpf) {
			return response(ctx, 401, {
				mensagem: 'Esse cliente já está cadastrado.',
			});
		}
	}
	const resultDados2 = await TabelaUsuarios.localizarId(idUsuario);
	if (resultDados2.rows.length > 0) {
		const idUser = resultDados2.rows[0].id;
		if (idUsuario !== idUser.toString()) {
			return response(ctx, 400, { mensagem: 'Mal formatado' });
		}
	}
	const result = await TabelaClientes.adicionarClienteNaTabela(
		nome,
		cpf,
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
	const resultDados2 = await tabelaClientes.localizarIdClientes(id);
	if (resultDados2.rows.length > 0) {
		const idUser = resultDados2.rows[0].id;
		if (id !== idUser.toString()) {
			return response(ctx, 400, { mensagem: 'Mal formatado' });
		}
	}
	const result = await TabelaClientes.atualizarCliente(
		id,
		nome,
		cpf,
		email,
		tel
	);
	return response(ctx, 200, result.rows);
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
