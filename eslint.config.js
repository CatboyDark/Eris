import { defineConfig, globalIgnores } from 'eslint/config'
import stylistic from '@stylistic/eslint-plugin'
import json from '@eslint/json'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default defineConfig([
	globalIgnores(['package-lock.json', 'dist/**', 'node_modules/**']),

	...tseslint.configs.recommended,

	{ files: ['**/*.json'], plugins: { json }, language: 'json/json', extends: ['json/recommended'] },
	{ files: ['**/*.jsonc'], plugins: { json }, language: 'json/jsonc', extends: ['json/recommended'] },

	{
		files: ['**/*.{js,mjs,cjs,ts,tsx}'],
		plugins: {
			stylistic,
			'@typescript-eslint': tseslint.plugin
		},
		languageOptions: {
			globals: {
				...globals.node,
				...globals.browser
			}
		},
		rules: {
			'stylistic/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
			'stylistic/indent': ['error', 'tab'],
			'stylistic/semi': ['error', 'never'],
			'stylistic/quotes': ['error', 'single'],
			'stylistic/comma-dangle': ['error', 'never'],
			'prefer-const': 'warn',
			'eqeqeq': ['warn', 'always'],
			'sort-imports': ['error', {
				'ignoreCase': false,
				'ignoreDeclarationSort': false,
				'ignoreMemberSort': false,
				'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single'],
				'allowSeparatedGroups': false
			}],
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
		}
	}
])