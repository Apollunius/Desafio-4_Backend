const jwt = require('jsonwebtoken');
const TabelaUsuarios = require('../repositories/tabelaUsuarios');
const Password = require('../utils/password');
const response = require('../utils/response');
require('dotenv').config();

const autenticar = async (ctx) => {
	const { email = null, senha = null } = ctx.request.body;

	if (!email || !senha) {
		return response(ctx, 400, { mensagem: 'Pedido mal-formatado' });
	}

	const resultUsuario = await TabelaUsuarios.localizarUsuario(email);
	const usuario = resultUsuario.rows[0];
	if (usuario) {
		const comparision = await Password.check(senha, usuario.senha);

		if (comparision) {
			const token = await jwt.sign(
				{ email: usuario.email, idUsuario: usuario.id, nome: usuario.nome },
				process.env.JWT_SECRET || 'cubosacademy',
				{ expiresIn: '1h' }
			);

			return response(ctx, 200, {
				mensagem: `Usuário logado com sucesso!`,
				token: `${token}`,
			});
		}
	}
	return response(ctx, 200, { mensagem: 'Email ou senha incorreto!' });
};

module.exports = { autenticar };
