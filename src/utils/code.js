const limparDado = (dado) => {
	return dado.replace(/[^\d]/g, ''); // isso aqui é pra usar regex pra retirar qualquer pontuação que possua.
};

const organizarCpf = (cpf) => {
	const cpfLimpo = limparDado(cpf);
	return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'); // isso aqui é pra formatar o cpf no padrão xxx.xxx.xxx-xx.
};

const organizarTelefone = (telefone) => {
	const telefoneLimpo = limparDado(telefone)
	if(telefoneLimpo.length == 13) {
		return telefoneLimpo.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 $2 $3-$4');
	} else if (telefoneLimpo.length == 12) {
		return telefoneLimpo.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '+$1 $2 $3-$4');
	} else if (telefoneLimpo.length == 11) {
		return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '$1 $2-$3');
	} else if (telefoneLimpo.length == 10) {
		return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2-$3');
	}
	
};

module.exports = { organizarCpf, limparDado, organizarTelefone };

