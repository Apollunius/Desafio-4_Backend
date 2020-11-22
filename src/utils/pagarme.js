const axios = require('axios');
require('dotenv').config();

pagarme.client.connect({ api_key: process.env.PAGARME_KEY }).then((client) =>
	client.transactions.create({
		amount: 1000,
		payment_method: 'boleto',
		postback_url: 'http://requestb.in/pkt7pgpk',
		customer: {
			type: 'individual',
			country: 'br',
			name: 'Aardvark Silva',
			documents: [
				{
					type: 'cpf',
					number: '00000000000',
				},
			],
		},
	})
);
