import testingLibrary from "eslint-plugin-testing-library";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import jest from "eslint-plugin-jest";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const eslintConfig = [
  ...compat.extends(
    "next",
    "prettier",
    "eslint:recommended",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ),
  {
    plugins: {
      "testing-library": testingLibrary,
      "@typescript-eslint": typescriptEslint,
      jest,
    },

    languageOptions: {
      globals: { ...globals.jest },
      parser: tsParser,
    },

    rules: {
      camelcase: [
        "error",
        {
          properties: "never",
        },
      ],

      "comma-dangle": [
        "error",
        {
          arrays: "always-multiline",
          objects: "always-multiline",
          imports: "always-multiline",
          exports: "always-multiline",
          functions: "never",
        },
      ],
      curly: "error",
      "dot-notation": ["error"],
      eqeqeq: ["error"],
      "func-style": ["error", "declaration"],

      ...jest.configs.recommended.rules,

      "no-else-return": [
        "error",
        {
          allowElseIf: false,
        },
      ],

      "no-multiple-empty-lines": [
        "error",
        {
          max: 1,
          maxEOF: 0,
        },
      ],

      "no-trailing-spaces": ["error"],
      "no-useless-constructor": ["error"],
      "object-curly-spacing": ["error", "always"],
      "object-shorthand": ["error"],
      "prefer-const": ["error"],
      "prefer-template": "error",

      "react/no-unused-prop-types": [
        "error",
        {
          skipShapeProps: true,
        },
      ],

      "react/prop-types": [
        "error",
        {
          ignore: ["children"],
        },
      ],

      "react/self-closing-comp": [
        "error",
        {
          component: true,
          html: true,
        },
      ],

      "react-hooks/exhaustive-deps": "off",
      semi: ["error", "always"],
      "space-before-blocks": ["error", "always"],

      "space-before-function-paren": [
        "error",
        {
          anonymous: "always",
          named: "never",
          asyncArrow: "always",
        },
      ],

      "testing-library/await-async-queries": "error",
      "testing-library/no-debugging-utils": "warn",
      "testing-library/no-dom-import": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
