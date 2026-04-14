/**
 * Снимок ответа внешнего API в test_audit и проверка round-trip из БД.
 * Разработчик проекта: [Space108] — AI Developer & AI Full-stack Quality
 */

import { expect } from '@playwright/test';
import { dbGet, dbRun } from './sqlite-client';

export async function persistAndVerifyApiSnapshot(
  route: string,
  payload: unknown
): Promise<void> {
  const json = JSON.stringify(payload);
  const { lastID } = await dbRun(
    'INSERT INTO test_audit (route, response_json) VALUES (?, ?)',
    [route, json]
  );
  const row = await dbGet<{ response_json: string }>(
    'SELECT response_json FROM test_audit WHERE id = ?',
    [lastID]
  );
  expect(row, `audit row for ${route}`).toBeTruthy();
  expect(JSON.parse(row!.response_json)).toEqual(payload);
}
