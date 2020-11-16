const bcrypt = require('bcryptjs');

const check = async (password, hash) => {
	const comparison = await bcrypt.compare(password, hash);
	return comparison;
};

module.exports = { check };
