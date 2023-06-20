module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier',
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'simple-import-sort', 'import'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte'],
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
		},
	],
	rules: {
		'simple-import-sort/imports': [
			'error',
			{
				// https://github.com/lydell/eslint-plugin-simple-import-sort/blob/6effda6457e365982c9726f7ff787bc2cb4679ed/examples/.eslintrc.js#L177-L185
				// The default grouping, but with type imports last as a separate
				// group, sorting that group like non-type imports are grouped.
				groups: [
					['^\\u0000'],
					['^node:'],
					['^\\$?\\w'],
					['^'],
					['^\\.'],
					['^node:.*\\u0000$', '^@?\\w.*\\u0000$', '^[^.].*\\u0000$', '^\\..*\\u0000$'],
				],
			},
		],
		'simple-import-sort/exports': 'error',
		'import/first': 'error',
		'import/newline-after-import': 'error',
		'import/no-duplicates': 'error',
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				varsIgnorePattern: '^_',
				argsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_',
				destructuredArrayIgnorePattern: '^_',
			},
		],
	},
};
