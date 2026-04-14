/**
 * Генерация PNG для README (docs/readme/). Запуск: npm run docs:screenshots
 * Разработчик проекта: [Space108] — AI Developer & AI Full-stack Quality
 */

import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
import { test, expect } from '@playwright/test';

const OUT_DIR = path.join(__dirname, '..', 'docs', 'readme');
const BASE = 'http://127.0.0.1:3847';

test.beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

test('README: локальный GET /health в браузере', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 420 });
  await page.goto(`${BASE}/health`);
  await expect(page.locator('body')).toContainText('ok');
  await page.screenshot({
    path: path.join(OUT_DIR, '01-local-health.png'),
    fullPage: true,
  });
});

test('README: ответ GET /api/users (JSON в браузере)', async ({ page, request }) => {
  await request.delete(`${BASE}/api/users`);
  const create = await request.post(`${BASE}/api/users`, {
    data: { name: 'Demo User', role: 'readme-shot' },
  });
  expect(create.status()).toBe(201);

  await page.setViewportSize({ width: 900, height: 520 });
  await page.goto(`${BASE}/api/users`);
  await page.screenshot({
    path: path.join(OUT_DIR, '02-api-users-json.png'),
    fullPage: true,
  });

  await request.delete(`${BASE}/api/users`);
});

test('README: фрагмент HTML-отчёта Playwright (если уже есть прогон)', async ({
  page,
}) => {
  const reportIndex = path.join(__dirname, '..', 'playwright-report', 'index.html');
  if (!fs.existsSync(reportIndex)) {
    test.skip();
    return;
  }

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto(pathToFileURL(reportIndex).href);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.screenshot({
    path: path.join(OUT_DIR, '03-playwright-report.png'),
    fullPage: false,
  });
});
