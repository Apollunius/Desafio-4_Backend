const axios = require('axios').default;

require('dotenv').config();

const pay = async (amount, descricao, vencimento, nome, cpf) => {
	try {
		const transaction = await axios.post(
			'https://api.pagar.me/1/transactions',
			{
				amount,
				boleto_instructions: descricao,
				boleto_expiration_date: vencimento,
				customer: {
					type: 'individual',
					country: 'br',
					name: nome,
					documents: [
						{
							type: 'cpf',
							number: cpf,
						},
					],
				},

				payment_method: 'boleto',
				api_key: process.env.PAGARME_KEY,
			}
		);
		return transaction.data;
	} catch (err) {
		console.log(err.response.data);
		return {
			status: 'error',
			data: {
				mensagem: 'Erro no Pagamento',
			},
		};
	}
};

module.exports = { pay };
