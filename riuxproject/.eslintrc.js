module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "settings": {
        "react": {
            "version": "detect"
        }
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/eslint-recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "@typescript-eslint"
    ],
    "rules": {
        "no-unused-vars": "off",
        "no-useless-escape": "warn",
        "no-irregular-whitespace": "warn",
        "no-self-assign": "warn",
        "no-prototype-builtins": "off",
        "no-control-regex": "off",
        "no-constant-condition": "warn",
        "no-case-declarations": "off",
        "camelcase": "off",
        "react/jsx-no-target-blank": "off",    // Needs review
        "react/no-find-dom-node": "off",       // Needs review
        "react/prop-types": [2, { ignore: ['children', 'customValidators'] }],
        "react/no-unescaped-entities": "off",
        "react/display-name": "off",
        "react/no-deprecated": "warn",
        "react/no-children-prop": "off",
    }
};
