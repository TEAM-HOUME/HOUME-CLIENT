// tsconfig.node.json 파일이 vite.config.ts를 위해 존재함
// vite.config.ts는 브라우저가 아니라 Node.js가 읽어서 실행하는 빌드 설정 파일

import path from 'path';

import { sentryVitePlugin } from '@sentry/vite-plugin';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.lottie'],
  plugins: [
    react(),
    vanillaExtractPlugin(),
    // 프로덕션 빌드 시 source map을 Sentry에 업로드 (auth token이 있을 때만 동작)
    sentryVitePlugin({
      org: process.env['SENTRY_ORG'],
      project: process.env['SENTRY_PROJECT'],
      authToken: process.env['SENTRY_AUTH_TOKEN'],
      disable: !process.env['SENTRY_AUTH_TOKEN'],
      // 업로드 후 dist에 남은 .map 삭제 → 배포물에 원본 소스 노출 방지
      sourcemaps: {
        filesToDeleteAfterUpload: ['./dist/**/*.map'],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(
      process.env['npm_package_version'] ?? '0.0.0'
    ),
  },
  build: {
    // source map은 Sentry auth token이 있을 때만 생성 → 업로드 후 플러그인이 삭제(원본 노출 방지)
    sourcemap: process.env['SENTRY_AUTH_TOKEN'] ? 'hidden' : false,
  },
  server: {
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@analytics': path.resolve(__dirname, 'src/shared/analytics'),
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
