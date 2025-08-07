/* eslint-env node */

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.stylistic,
  eslintPluginUnicorn.configs.recommended,

  {
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],

    files: ['**/*.ts'],

    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },

    rules: {
      // we can override some problematic import rules here
      // that can cause issues when using import aliases.
      'import/extensions': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/order': [
        'error',
        {
          pathGroups: [
            {
              pattern: '@server/**',
              group: 'internal',
            },
            {
              pattern: '@tests/**',
              group: 'internal',
            },
          ],
        },
      ],
      'import/no-dynamic-require': 'warn',
      'import/no-nodejs-modules': 'off',

      // functions are always hoisted, so we can use them before they are defined
      // which in various cases improves readability
      'no-use-before-define': ['error', { functions: false }],
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false },
      ],

      'unicorn/better-regex': 'warn',
      'import/no-unresolved': 'off',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true,
          },
        },
      ],
    },
  },

  {
    files: [
      'src/database/migrate/latest.ts',
      'src/database/migrations/**/*.ts',
      '**/*.spec.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-useless-undefined': 'off',
    },
  },

  prettierConfig,
  prettierPluginRecommended
);
