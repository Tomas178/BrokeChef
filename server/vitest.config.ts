import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['**/src/**/*.ts'],
      exclude: [
        '**/src/database/**',
        '**/src/entities/**',
        '**/src/trpc/index.ts',
        '**/src/repositories/index.ts',
        '**/src/services/index.ts',
        'src/shared',
        'src/index.ts',
        'src/types/',
        'src/enums',
        'src/logger.ts',
        'src/auth.ts',
      ],
    },

    // necessary for Vitest VS Code extension to pick up env variables
    env: loadEnv('', process.cwd(), ''),
  },
  resolve: {
    alias: {
      '@server': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
