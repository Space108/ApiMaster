/**
 * Только генерация скриншотов для README (без перезаписи playwright-report).
 * Разработчик проекта: [Space108] — AI Developer & AI Full-stack Quality
 */

import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testMatch: '**/readme-screenshots.spec.ts',
  testIgnore: [],
  reporter: [['list']],
});
