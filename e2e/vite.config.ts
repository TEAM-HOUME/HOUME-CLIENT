import { resolve } from 'node:path';

import { defineConfig, mergeConfig } from 'vite';

import base from '../vite.config';

export default defineConfig(
  mergeConfig(base, {
    envDir: resolve('test-results/image-flow/empty-env'),
    plugins: [
      {
        name: 'image-flow-remove-resource-hints',
        transformIndexHtml(html: string) {
          return html.replace(
            /<link\b[^>]*rel=["'](?:preconnect|dns-prefetch)["'][^>]*>/gi,
            ''
          );
        },
      },
    ],
    build: {
      outDir: 'test-results/image-flow/build',
      emptyOutDir: true,
      sourcemap: false,
    },
    preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  })
);
