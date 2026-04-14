/**
 * Короткий браузерный заход на /health — включает запись video (playwright video: on).
 * Разработчик проекта: [Space108] — AI Developer & AI Full-stack Quality
 */

import { test, expect } from '@playwright/test';

const BASE = 'http://127.0.0.1:3847';

test('Smoke: страница /health (JSON) — артефакт видео', async ({ page }) => {
  const response = await page.goto(`${BASE}/health`);
  expect(response?.ok()).toBeTruthy();
  const text = await page.locator('body').innerText();
  expect(text).toContain('ok');
  expect(text).toContain('APIMASTER');
});
