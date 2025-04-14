import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';

export default [
  // Base configs
  js.configs.recommended,
  {
    ignores: [
      'node_modules/**',
      '.svelte-kit/**',
      'build/**',
      '.vercel/**',
      '.output/**',
      'static/**',
      'package'
    ]
  },

  // Global settings and rules
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        extraFileExtensions: ['.svelte']
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        alert: 'readonly',
        location: 'readonly',
        // DOM types
        HTMLDivElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        MouseEvent: 'readonly',
        TouchEvent: 'readonly',
        KeyboardEvent: 'readonly',
        Node: 'readonly',
        NodeJS: 'readonly',
        // Buffer and response
        Buffer: 'readonly',
        Response: 'readonly',
        // Web APIs
        Notification: 'readonly',
        // Node globals
        process: 'readonly',
        module: 'readonly',
        // SvelteKit globals
        fetch: 'readonly'
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin
    },
    rules: {
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-undef': 'warn', // Changed from error to warn
      '@typescript-eslint/no-explicit-any': 'warn', // Changed from error to warn
      'prettier/prettier': 'error'
    }
  },

  // TypeScript specific rules
  {
    files: ['**/*.ts', '**/*.js'],
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...tseslint.configs.recommended.rules
    }
  },

  // Svelte specific rules
  {
    files: ['**/*.svelte'],
    plugins: {
      svelte: sveltePlugin
    },
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsparser
      }
    },
    rules: {
      ...sveltePlugin.configs.recommended.rules,
      'svelte/no-at-html-tags': 'warn'
    }
  },

  // Prettier overrides
  {
    rules: {
      'prettier/prettier': 'error'
    }
  }
];
