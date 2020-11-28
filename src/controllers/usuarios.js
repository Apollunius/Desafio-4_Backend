const TabelaUsuarios = require('../repositories/tabelaUsuarios');
const response = require('../utils/response');
const Password = require('../utils/password');
const { enviarEmail } = require('../utils/email');
const Codigo = require('../utils/code')

const adicionarUsuario = async (ctx) => {
	const { email = null, senha = null, nome = null } = ctx.request.body;
	if (!email || !senha || !nome) {
		return response(ctx, 400, { mensagem: 'Mal formatado' });
	}

	// verifica se o email solicitado já existe na tabela.
	const resultDados = await TabelaUsuarios.localizarUsuario(email);
	if (resultDados.rows.length > 0) {
		const emailUsuario = resultDados.rows[0].email;
		if (emailUsuario === email) {
			return response(ctx, 401, { mensagem: 'Email já existente' });
		}
	}

	const senhaEncriptada = await Password.encrypt(senha);

	const result = await TabelaUsuarios.adicionarUsuarioNaTabela(
		email,
		senhaEncriptada,
		nome
	);
	const { id } = result.rows.shift();
	enviarEmail(
		email,
		'Cadastro realizado com sucesso!',
		Codigo.htmlParaEmail('http://www.mailgun.com','Confirmar o email!', '', 'Por favor confirme seu endereço de email clicando pelo link abaixo.')
	);
	return response(ctx, 201, { id: `${id}` });
};

module.exports = { adicionarUsuario };
