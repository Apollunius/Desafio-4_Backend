const limparCpf = (cpf) => {
	return cpf.replace(/[^\d]/g, ''); // isso aqui é pra usar regex pra retirar qualquer pontuação que possua.
};

const montarCpf = (cpf) => {
	const cpfLimpo = limparCpf(cpf);
	return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'); // isso aqui é pra formatar o cpf no padrão xxx.xxx.xxx-xx.
};

module.exports = { limparCpf, montarCpf };
