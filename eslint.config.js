const globals = require('globals');

module.exports =
{
    languageOptions:
	{
	    sourceType: 'commonjs',
	    globals: {
	        ...globals.node
	    }
	},

    rules:
	{
	    'prefer-const': 'warn',
	    'no-const-assign': 'warn',
	    'no-var': 'warn',
	    'no-new-object': 'warn',
	    'object-shorthand': 'warn',
	    'quote-props': ['warn', 'consistent-as-needed'],
	    'prefer-object-spread': 'warn',
	    'no-array-constructor': 'warn',
	    'quotes': ['warn', 'single'],
	    'prefer-template': 'warn',
	    'template-curly-spacing': ['warn', 'never'],
	    'no-useless-concat': 'warn',
	    'no-eval': 'warn',
	    'no-useless-escape': 'warn',
	    'no-loop-func': 'warn',
	    'prefer-rest-params': 'warn',
	    'no-new-func': 'warn',
	    'space-before-function-paren': ['warn', 'never'],
	    'space-before-blocks': ['warn', 'always'],
	    'no-param-reassign': 'warn',
	    'prefer-spread': 'warn',
	    'prefer-arrow-callback': 'warn',
	    'arrow-spacing': 'warn',
	    'no-useless-constructor': 'warn',
	    'no-dupe-class-members': 'warn',
	    'no-iterator': 'warn',
	    'no-restricted-syntax': 'warn',
	    'dot-notation': 'warn',
	    'no-undef': 'warn',
	    'one-var': ['warn', 'never'],
	    'no-multi-assign': 'warn',
	    'no-unused-vars': 'warn',
	    'no-use-before-define': 'warn',
	    'eqeqeq': 'warn',
	    'no-case-declarations': 'warn',
	    'no-unneeded-ternary': 'warn',
	    'no-mixed-operators': 'warn',
	    'nonblock-statement-body-position': 'warn',
	    'no-else-return': 'warn',
	    'spaced-comment': 'warn',
	    'keyword-spacing': 'warn',
	    'space-infix-ops': 'warn',
	    'eol-last': 'warn',
	    'indent': ['warn', 4],
	    'no-trailing-spaces': 'warn',
	    'no-multiple-empty-lines': 'warn',
	    'space-in-parens': 'warn',
	    'array-bracket-spacing': 'warn',
	    'object-curly-spacing': ['warn', 'always'],
	    'block-spacing': 'warn',
	    'comma-spacing': 'warn',
	    'no-debugger': 'warn',
	    'func-call-spacing': 'warn',
	    'key-spacing': 'warn',
	    'comma-style': 'warn',
	    'semi': ['warn', 'always'],
	    'comma-dangle': ['warn', 'never'],
	    'no-new-wrappers': 'warn',
	    'brace-style': ['warn', 'stroustrup']
	}
};
