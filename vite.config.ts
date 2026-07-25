/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import path from 'path';

import { sentryVitePlugin } from '@sentry/vite-plugin';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import svgr from 'vite-plugin-svgr';
// https://vite.dev/config/
const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

/** 배포 감지용 빌드 ID (Sentry용 __APP_VERSION__과 분리)
 * 배포(빌드) 인스턴스마다 고유해야 같은 커밋 재배포도 감지 가능
 */
const buildId =
  process.env.VERCEL_DEPLOYMENT_ID ??
  (process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SHA ?? 'gha'}-${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT ?? '1'}`
    : undefined) ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.GITHUB_SHA ??
  Date.now().toString();

function versionFilePlugin(version: string): Plugin {
  return {
    name: 'generate-version-file',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({
          version,
          builtAt: new Date().toISOString(),
        }),
      });
    },
  };
}

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  assetsInclude: ['**/*.lottie'],
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
    versionFilePlugin(buildId),
    // 프로덕션 빌드 시 source map을 Sentry에 업로드 (auth token이 있을 때만 동작)
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      disable: !process.env.SENTRY_AUTH_TOKEN,
      // 업로드 후 dist에 남은 .map 삭제 → 배포물에 원본 소스 노출 방지
      sourcemaps: {
        filesToDeleteAfterUpload: ['./dist/**/*.map'],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
    __BUILD_ID__: JSON.stringify(buildId),
  },
  build: {
    // source map은 Sentry auth token이 있을 때만 생성 → 업로드 후 플러그인이 삭제(원본 노출 방지)
    sourcemap: process.env.SENTRY_AUTH_TOKEN ? 'hidden' : false,
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
        // 테스트 환경 구축에 필요한 설정들
        extends: true, // vanillaExtractPlugin 등 Vite 플러그인 상속 (.css.ts import 동작에 필요)
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
          environment: 'jsdom', // React 컴포넌트 렌더링에 필요한 브라우저 DOM 환경
          globals: true, // describe/it/expect를 import 없이 사용
          setupFiles: ['vitest.setup.ts'], // jest-dom 매처 등록 + cleanup 설정
        },
      },
    ],
    // 테스트 커버리지 확인용
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.css.ts',
        'src/**/*.stories.tsx',
      ],
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@stories': path.resolve(__dirname, 'src/stories'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@apis': path.resolve(__dirname, 'src/shared/apis'),
      '@assets': path.resolve(__dirname, 'src/shared/assets'),
      '@components': path.resolve(__dirname, 'src/shared/components'),
      '@constants': path.resolve(__dirname, 'src/shared/constants'),
      '@hooks': path.resolve(__dirname, 'src/shared/hooks'),
      '@styles': path.resolve(__dirname, 'src/shared/styles'),
      // @types는 npm @types 스코프와 충돌하므로 사용 불가 → @shared/types/ 사용
      '@utils': path.resolve(__dirname, 'src/shared/utils'),
      '@store': path.resolve(__dirname, 'src/store'),
    },
  },
});
