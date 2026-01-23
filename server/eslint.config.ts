/* eslint-env node */

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
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
          case: 'camelCase',
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],

      'unicorn/prevent-abbreviations': [
        'error',
        {
          replacements: {
            res: false,
            req: false,
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
      'unicorn/no-null': 'off',
    },
  },

  {
    files: [
      '**/src/utils/errors/**',
      'src/enums/**',
      'src/routes/utils/FileSizeValidator.ts',
    ],
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          case: 'pascalCase',
        },
      ],
    },
  },

  prettierConfig
);
