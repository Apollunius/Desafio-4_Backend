const TabelaClientes = require('../repositories/tabelaClientes');
const TabelaUsuarios = require('../repositories/tabelaUsuarios');
const response = require('../utils/response');
// const Password = require('../utils/password');

const adicionarCliente = async (ctx) => {
	TabelaClientes.criarTabelaClientes(); // cria a tabela de clientes se caso ainda não existir

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
	console.log(resultDados);
	const cpfCliente = resultDados.rows[0].cpf;
	if (cpfCliente === cpf) {
		return response(ctx, 401, {
			mensagem: 'Esse cliente já está cadastrado.',
		});
	}

	const resultDados2 = await TabelaUsuarios.localizarId(idUsuario);
	const idUser = resultDados2.rows[0].id;
	if (idUsuario !== idUser.toString()) {
		return response(ctx, 400, { mensagem: 'Mal formatado' });
	}
	const result = await TabelaClientes.adicionarClienteNaTabela(
		nome,
		cpf,
		email,
		tel,
		idUsuario
	);
	console.log(result.rows);
	const { id } = await result.rows.shift();
	return response(ctx, 201, { id: `${id}` });
};
module.exports = { adicionarCliente };
