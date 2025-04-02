// eslint.config.js
import { createRequire } from 'node:module';
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

const require = createRequire(import.meta.url); // Needed to import legacy plugins

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020,
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.svelte'],
    processor: require('eslint-plugin-svelte3').processors.svelte3,
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    settings: {
      'svelte3/typescript': true,
    },
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
