/**
 * APIMASTER — Playwright (API + браузерные артефакты).
 * Разработчик проекта: [Space108] — AI Developer & AI Full-stack Quality
 */

import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/readme-screenshots.spec.ts'],
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: [
    ['list'],
    // Вне test-results — иначе HTML-репортёр очищает папку и удаляет trace/video.
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['./tests/reporters/bug-report-reporter.ts'],
  ],
  use: {
    // Видео — только там, где открывается страница (fixture `page`).
    video: 'on',
    // Локально: скрин после каждого теста с браузером; в CI — только при падении.
    screenshot: isCI ? 'only-on-failure' : 'on',
    // Trace: таймлайн + сеть (в т.ч. API request) — смотреть через `npx playwright show-trace`.
    trace: isCI ? 'retain-on-failure' : 'on',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node api/server.js',
    url: 'http://127.0.0.1:3847/health',
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      APIMASTER_TEST_MODE: '1',
      APICENTER_PORT: '3847',
    },
  },
});
