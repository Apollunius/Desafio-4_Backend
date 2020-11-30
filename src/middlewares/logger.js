const logger = (ctx, next) => {
	console.log(ctx.method, ctx.url);

	return next();
};

module.exports = logger;
