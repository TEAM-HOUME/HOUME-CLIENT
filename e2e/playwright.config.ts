import { resolve } from 'node:path';

import { defineConfig } from '@playwright/test';

const runDir = process.env['E2E_RUN_DIR'] ?? 'test-results/image-flow/direct';
export default defineConfig({
  testDir: '.',
  testMatch: ['imageFlow.spec.ts', 'harness.spec.ts'],
  timeout: 90_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  outputDir: resolve(runDir, 'artifacts'),
  reporter: [
    ['list'],
    ['json', { outputFile: resolve(runDir, 'results.json') }],
  ],
  use: {
    browserName: 'chromium',
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 390, height: 844 },
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
    serviceWorkers: 'block',
  },
  webServer: {
    cwd: resolve(import.meta.dirname, '..'),
    command:
      'node node_modules/vite/bin/vite.js preview --config e2e/vite.config.ts',
    url: 'http://127.0.0.1:4173',
    timeout: 30_000,
    reuseExistingServer: false,
  },
});
