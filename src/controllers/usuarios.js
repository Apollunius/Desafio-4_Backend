const TabelaUsuarios = require('../repositories/tabelaUsuarios');
const response = require('../utils/response');
const Password = require('../utils/password');

const adicionarUsuario = async (ctx) => {
	const emails = new Set();
	TabelaUsuarios.criarTabelaUsuario();
	const { email = null, senha = null, nome = null } = ctx.request.body;
	if (!email || !senha || !nome) {
		return response(ctx, 400, { mensagem: 'Mal formatado' });
	}
	if (emails.has(email)) {
		console.log('not today');
	} else {
		emails.add(email);
	}
	const senhaEncriptada = await Password.encrypt(senha);
	console.log(senhaEncriptada);
	const result = await TabelaUsuarios.adicionarUsuarioNaTabela(
		email,
		senhaEncriptada,
		nome
	);
	const { id } = result.rows.shift();
	return response(ctx, 201, `{id: ${id}}`);
};

module.exports = { adicionarUsuario };
