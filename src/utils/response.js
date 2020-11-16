const response = (ctx, code, dados) => {
	const status = code;
	ctx.status = code;
	ctx.body = {
		status,
		dados,
	};
};

module.exports = response;
