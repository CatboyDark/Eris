import globals from "globals";
import js from "@eslint/js";

export default {
  ignores: ["node_modules/*"],
  languageOptions: {
    ecmaVersion: 2021,
    sourceType: "commonjs",
    globals: {
      ...globals.commonjs,
      ...globals.es2021,
      ...globals.node,
    },
  },

  rules: {
    "brace-style": ["error", "allman", { allowSingleLine: true }],
    indent: ["warn", 4],
    quotes: ["warn", "single"],
    semi: ["warn", "always"],

    "object-curly-spacing": ["warn", "always"],
    "space-before-blocks": ["warn", "always"],
    "space-before-function-paren": ["warn", "never"],
    "space-in-parens": "warn",
    "block-spacing": "warn",
    "comma-spacing": "warn",

    "array-bracket-spacing": "warn",
    "comma-dangle": ["warn", "never"],
    "comma-style": "warn",
    curly: ["warn", "all"],
    "dot-notation": "warn",
    "func-call-spacing": "warn",
    "keyword-spacing": "warn",
    "no-multi-spaces": "warn",
    "no-trailing-spaces": "warn",
    "no-multiple-empty-lines": "warn",
    "spaced-comment": "warn",
    "eol-last": "warn",

    eqeqeq: "warn",
    "no-array-constructor": "warn",
    "no-case-declarations": "warn",
    "no-const-assign": "warn",
    "no-debugger": "warn",
    "no-dupe-class-members": "warn",
    "no-eval": "warn",
    "no-else-return": "warn",
    "no-iterator": "warn",
    "no-loop-func": "warn",
    "no-multi-assign": "warn",
    "no-new-func": "warn",
    "no-new-object": "warn",
    "no-unused-vars": "warn",
    "no-use-before-define": "warn",
    "no-unneeded-ternary": "warn",
    "no-var": "warn",
    "nonblock-statement-body-position": "warn",

    "object-shorthand": "warn",
    "prefer-arrow-callback": "warn",
    "prefer-const": "warn",
    "prefer-object-spread": "warn",
    "prefer-rest-params": "warn",
    "prefer-spread": "warn",
    "prefer-template": "warn",
    "quote-props": ["warn", "consistent-as-needed"],
  },
};