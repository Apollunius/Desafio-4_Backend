const TabelaUsuarios = require('../repositories/tabelaUsuarios');
const response = require('../utils/response');

const adicionarUsuario = async (ctx) => {
	TabelaUsuarios.criarTabelaUsuario();
	const { email = null, senha = null, nome = null } = ctx.request.body;
	if (!email || !senha || !nome) {
		return response(ctx, 400, { mensagem: 'Mal formatado' });
	}
	const result = await TabelaUsuarios.adicionarUsuarioNaTabela(
		email,
		senha,
		nome
	);
	return response(ctx, 201, result.rows.shift());
};

module.exports = { adicionarUsuario };
