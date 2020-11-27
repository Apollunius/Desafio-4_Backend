const jwt = require('jsonwebtoken');
const response = require('../utils/response');

require('dotenv').config();

/**
 * verifica se usuário fez login e se o token estiver validado.
 */
const verify = async (ctx, next) => {
	if (!ctx.headers.authorization) {
		return response(ctx, 403, { mensagem: 'Ação Proibida' });
	}
	const [, token] = ctx.headers.authorization.split(' ');
	try {
		const verification = await jwt.verify(token, process.env.JWT_SECRET);
		ctx.state.email = verification.email;
		ctx.state.idUsuario = verification.idUsuario;
		ctx.state.nome = verification.nome;
	} catch (err) {
		return response(ctx, 403, { mensagem: 'Ação Proibida' });
	}

	return next();
};

module.exports = { verify };
