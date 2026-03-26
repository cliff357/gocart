import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Global ignores
  {
    ignores: [
      "node_modules/",
      ".next/",
      "out/",
      "public/",
      "coverage/",
      "playwright-report/",
      "test-results/",
      "scripts/",
      "prisma/",
      "*.config.js",
      "*.config.mjs",
      "jest.setup.js",
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // App source files
  {
    files: ["**/*.{js,jsx,mjs}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        React: "readonly",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React
      "react/react-in-jsx-scope": "off", // Next.js 不需要 import React
      "react/prop-types": "off", // 唔用 PropTypes
      "react/no-unescaped-entities": "warn",
      "react/jsx-no-target-blank": "error",
      "react/display-name": "off",

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Next.js
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",

      // General
      "no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
      }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "prefer-const": "warn",
      "no-var": "error",
    },
  },

  // Test files + mocks + setup — relaxed rules with Jest globals
  {
    files: [
      "__tests__/**/*.{js,jsx}",
      "__mocks__/**/*.{js,jsx}",
      "**/*.test.{js,jsx}",
      "**/*.spec.{js,jsx}",
      "jest.setup.js",
      "jest.emulator.setup.js",
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      "no-unused-vars": "off",
      "no-console": "off",
    },
  },
];
