/// <reference types="vitest/config" />
import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
// https://vite.dev/config/
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
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
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@layout': path.resolve(__dirname, 'src/layout'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@stories': path.resolve(__dirname, 'src/stories'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@apis': path.resolve(__dirname, 'src/shared/apis'),
      '@assets': path.resolve(__dirname, 'src/shared/assets'),
      '@components': path.resolve(__dirname, 'src/shared/components'),
      '@constants': path.resolve(__dirname, 'src/shared/constants'),
      '@hooks': path.resolve(__dirname, 'src/shared/hooks'),
      '@styles': path.resolve(__dirname, 'src/shared/styles'),
      '@types': path.resolve(__dirname, 'src/shared/types'),
      '@utils': path.resolve(__dirname, 'src/shared/utils'),
    },
  },
});
