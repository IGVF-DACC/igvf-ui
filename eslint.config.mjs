import { defineConfig } from "eslint/config";
import testingLibrary from "eslint-plugin-testing-library";
import cypress from "eslint-plugin-cypress";
import reactPlugin from "eslint-plugin-react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import jest from "eslint-plugin-jest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  // Shared base config
  {
    extends: compat.extends(
      "next",
      "prettier",
      "eslint:recommended",
      "next/core-web-vitals",
      "plugin:react/recommended",
      "plugin:@typescript-eslint/recommended"
    ),

    plugins: {
      react: reactPlugin,
      "testing-library": testingLibrary,
      "@typescript-eslint": typescriptEslint,
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
          functions: "ignore",
        },
      ],
      curly: "error",
      "dot-notation": ["error"],
      eqeqeq: ["error"],
      "func-style": ["error", "declaration"],
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
      "one-var": ["error", "never"],
      "prefer-const": ["error"],
      "prefer-template": "error",
      "react/jsx-no-undef": "error",
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
      "react/react-in-jsx-scope": "off",
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
    },
  },

  // TypeScript-specific config
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
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

  // JavaScript-specific config
  {
    files: ["**/*.js", "**/*.jsx"],
    rules: {
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  ...compat.extends("plugin:jest/recommended"),

  // Test file overrides
  {
    files: ["**/*.test.{js,ts,jsx,tsx}", "**/*.spec.{js,ts,jsx,tsx}"],
    plugins: {
      jest,
    },
    languageOptions: {
      globals: {
        afterAll: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        describe: "readonly",
        expect: "readonly",
        it: "readonly",
        jest: "readonly",
        test: "readonly",
      },
    },
  },
  {
    files: [
      "cypress.config.{js,mjs,cjs}",
      "cypress/**/*.cy.{js,ts,jsx,tsx}",
      "cypress/support/**/*.{js,ts,jsx,tsx}",
    ],
    plugins: {
      cypress,
    },
    languageOptions: {
      globals: {
        cy: "readonly",
        Cypress: "readonly",
        describe: "readonly",
        it: "readonly",
        before: "readonly",
        after: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
    rules: {
      ...cypress.configs.recommended.rules,
      "cypress/no-unnecessary-waiting": "off",
      "jest/expect-expect": "off",
    },
  },
]);
