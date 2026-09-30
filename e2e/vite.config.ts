import { resolve } from 'node:path';

import { defineConfig, mergeConfig } from 'vite';

import base from '../vite.config';

export default defineConfig(
  mergeConfig(base, {
    envDir: resolve('test-results/image-flow/empty-env'),
    plugins: [
      {
        name: 'image-flow-stall-fault',
        enforce: 'pre',
        transform(code: string, id: string) {
          if (
            id.endsWith(
              '/src/pages/generate/apis/mutations/useGenerateFullFunnelImageMutation.ts'
            )
          ) {
            const marker = '      setNavigationData(data);';
            if (code.split(marker).length !== 2)
              throw new Error(
                'Full funnel navigation data fault injection point changed'
              );
            return code.replace(
              marker,
              `
      // E2E only: response succeeds but navigation data is deliberately lost.
      if (!globalThis.__E2E_DROP_NAVIGATION_DATA__) setNavigationData(data);
      else globalThis.__E2E_NAVIGATION_DATA_DROPPED__ = true;
`
            );
          }
          if (!id.endsWith('/src/pages/generate/pages/loading/LoadingPage.tsx'))
            return;
          const marker =
            '    const { imageId, imageUrl, isMirror } = navigationData;';
          if (code.split(marker).length !== 2)
            throw new Error('LoadingPage fault injection point changed');
          return code.replace(
            marker,
            `
    // E2E build only: stop the final result transition after a real successful response.
    if (globalThis.__E2E_HOLD_RESULT__) {
      globalThis.__E2E_RESULT_HELD__ = true;
      return;
    }
${marker}`
          );
        },
      },
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
