import { globalIgnores } from 'eslint/config';
import pluginVue from 'eslint-plugin-vue';
import {
  configureVueProject,
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript';
import playwright from 'eslint-plugin-playwright';
import vitest from '@vitest/eslint-plugin';

configureVueProject({
  tsSyntaxInTemplates: true,
  scriptLangs: ['ts'],
});

export default defineConfigWithVueTs(
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },

    rules: {
      'vue/multi-word-component-names': 'off',
      'import/no-relative-parent-imports': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'app',
                'config',
                'database',
                'entities',
                'modules',
                'repositories',
                'trpc',
                'utils',
              ].flatMap((path) => [
                `@server/${path}`,
                `@mono/server/src/${path}`,
              ]),
              message:
                'Please only import from @server/shared or @mono/server/src/shared.',
            },
          ],
        },
      ],
    },
  },

  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    '**/test-results/**',
    '**/playwright-report/**',
  ]),

  {
    ...playwright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/expect-expect': [
        'error',
        {
          assertFunctionNames: [
            'loginUser',
            'checkLocator',
            'checkIfRedirects',
            'checkRecipeMainInfo',
            'checkActionButton',
            'checkFollowsModalHeader',
            'checkRecipesSectionTitle',
          ],
        },
      ],
    },
  },

  {
    ...vitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  }
);
