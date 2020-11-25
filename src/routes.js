const Router = require('koa-router');
const Session = require('./middlewares/session');
const Auth = require('./controllers/auth');
const Users = require('./controllers/usuarios');
const Clients = require('./controllers/clientes');
const Payment = require('./controllers/payment');

const router = new Router();

router.post('/auth', Auth.autenticar); // autenticação do login
router.post('/usuarios', Users.adicionarUsuario); // criar usuário

router.post('/clientes', Session.verify, Clients.adicionarCliente); // criar clientes
router.put('/clientes', Session.verify, Clients.atualizarCliente); // editar clientes
router.get('/clientes', Session.verify, Clients.querystring); // listar clientes ou buscar cliente específico

router.post('/cobrancas', Session.verify, Payment.criarBoleto); // criar cobranças
router.get('/cobrancas', Session.verify, Payment.querystring); // listar cobranças (verificar a querystring)
router.put('/cobrancas', Session.verify, Payment.pagarBoleto); // pagar cobrança

// router.get('/relatorios', Session.verify); // obter relatório

module.exports = router;
