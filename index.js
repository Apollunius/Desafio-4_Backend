const Koa = require('koa');
const cors = require('@koa/cors');
const bodyparser = require('koa-bodyparser');

const server = new Koa();
const router = require('./src/routes');
const logger = require('./src/middlewares/logger');

const PORT = process.env.PORT || 8081;

server.use(cors());
server.use(bodyparser());
server.use(logger);
server.use(router.routes());

server.listen(PORT, () => console.log(`Running on ${PORT}`));
