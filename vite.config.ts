/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import path from 'path';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
// https://vite.dev/config/
const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    react(),
    vanillaExtractPlugin(),
    svgr({
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        svgoConfig: {
          floatPrecision: 2,
        },
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
  },
  server: {
    host: true,
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          ...(process.env.NODE_ENV !== 'production'
            ? [
                storybookTest({
                  configDir: path.join(dirname, '.storybook'),
                }),
              ]
            : []),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
      {
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
          environment: 'node',
        },
      },
    ],
  },
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom/client',
    ],
    alias: {
      react: path.resolve(dirname, 'node_modules/react'),
      'react-dom': path.resolve(dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(
        dirname,
        'node_modules/react/jsx-runtime.js'
      ),
      'react/jsx-dev-runtime': path.resolve(
        dirname,
        'node_modules/react/jsx-dev-runtime.js'
      ),
      'react-dom/client': path.resolve(
        dirname,
        'node_modules/react-dom/client.js'
      ),
      '@': path.resolve(dirname, 'src'),
      '@pages': path.resolve(dirname, 'src/pages'),
      '@layout': path.resolve(dirname, 'src/layout'),
      '@routes': path.resolve(dirname, 'src/routes'),
      '@stories': path.resolve(dirname, 'src/stories'),
      '@shared': path.resolve(dirname, 'src/shared'),
      '@apis': path.resolve(dirname, 'src/shared/apis'),
      '@assets': path.resolve(dirname, 'src/shared/assets'),
      '@components': path.resolve(dirname, 'src/shared/components'),
      '@constants': path.resolve(dirname, 'src/shared/constants'),
      '@hooks': path.resolve(dirname, 'src/shared/hooks'),
      '@styles': path.resolve(dirname, 'src/shared/styles'),
      '@types': path.resolve(dirname, 'src/shared/types'),
      '@utils': path.resolve(dirname, 'src/shared/utils'),
    },
  },
});
