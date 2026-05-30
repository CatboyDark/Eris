import js from '@eslint/js'
import json from '@eslint/json'
import stylistic from '@stylistic/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'

export default defineConfig([
	globalIgnores(['package-lock.json']),

	{ files: ['**/*.{js,mjs,cjs}'], plugins: { js }, extends: ['js/recommended'], languageOptions: { globals: globals.node } },
	{ files: ['**/*.json'], plugins: { json }, language: 'json/json', extends: ['json/recommended'] },
	{ files: ['**/*.jsonc'], plugins: { json }, language: 'json/jsonc', extends: ['json/recommended'] },
	{
		files: ['**/*.{js,mjs,cjs}'],
		plugins: { stylistic },
		rules: {
			'stylistic/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
			'stylistic/indent': ['error', 'tab'],
			'stylistic/semi': ['error', 'never'],
			'stylistic/quotes': ['error', 'single'],
			'stylistic/comma-dangle': ['error', 'never'],
			'stylistic/eol-last': ['error', 'never'],

			'prefer-const': 'warn',
			'no-unused-vars': ['warn'],
			'eqeqeq': ['warn', 'always']
		}
	}
])