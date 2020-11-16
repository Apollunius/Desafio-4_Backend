const Router = require('koa-router');
const Session = require('./middlewares/session');
const Auth = require('./controllers/auth');
const Users = require('./controllers/usuarios');

const router = new Router();

// router.post('/auth', Auth.autenticar); // autenticação do login
router.post('/usuarios', Users.adicionarUsuario); // criar usuário

// router.post('/clientes', Session.verify); // criar clientes
// router.put('/clientes', Session.verify); // editar clientes
// router.get('/clientes?clientesPorPagina=10&offset=20', Session.verify); // listar clientes (verificar a querystring)
// router.get(
// 	'/clientes?busca=texto da busca&clientesPorPagina=10&offset=20',
// 	Session.verify
// ); // buscar clientes (verificar a querystring)

// router.post('/cobrancas', Session.verify); // criar cobranças
// router.get('/cobrancas?cobrancasPorPagina=10&offset=20', Session.verify); // listar cobranças (verificar a querystring)
// router.put('/cobrancas', Session.verify); // pagar cobrança

// router.get('/relatorios', Session.verify); // obter relatório

module.exports = router;
