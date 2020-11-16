module.exports = {
	env: {
		node: true,
		commonjs: true,
		es2021: true,
	},
	extends: ['airbnb-base', 'prettier'],
	plugins: ['prettier'],
	parserOptions: {
		ecmaVersion: 12,
	},
	rules: {
		'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
		'no-console': 0,
		indent: ['error', 'tab'],
		'no-tabs': [2, { allowIndentationTabs: true }],
		'prettier/prettier': ['error'],
	},
};
