/**
 * Полный цикл CRUD через локальный API с проверкой строк в data/api_master.sqlite.
 * Разработчик проекта: [Space108] — AI Developer & AI Full-stack Quality
 */

import { test, expect } from '@playwright/test';
import { assertApiMatchesDbUser } from '../helpers/data-integrity';
import { dbAll, dbGet, type UserRow } from '../helpers/sqlite-client';

test.describe.configure({ mode: 'serial' });

const API_BASE = 'http://127.0.0.1:3847';

test.beforeEach(async ({ request }) => {
  const reset = await request.delete(`${API_BASE}/api/users`);
  expect(reset.status()).toBe(200);
  const body = await reset.json();
  expect(body).toMatchObject({ ok: true });
  const rows = await dbAll<UserRow>('SELECT id, name, role FROM users');
  expect(rows.length, 'таблица users должна быть пуста перед тестом').toBe(0);
});

test('CRUD: Create (API) → DB → Update (API) → DB → Delete (API) → пусто в DB', async ({
  request,
}) => {
  const createRes = await request.post(`${API_BASE}/api/users`, {
    data: { name: 'CRUD User', role: 'tester' },
  });
  expect(createRes.status()).toBe(201);
  const created = (await createRes.json()) as UserRow;
  expect(created.id).toBeGreaterThan(0);

  const rowAfterCreate = await dbGet<UserRow>(
    'SELECT id, name, role FROM users WHERE id = ?',
    [created.id]
  );
  assertApiMatchesDbUser(created, rowAfterCreate);

  const updateRes = await request.put(`${API_BASE}/api/users/${created.id}`, {
    data: { name: 'CRUD User Updated', role: 'lead' },
  });
  expect(updateRes.status()).toBe(200);
  const updated = (await updateRes.json()) as UserRow;
  expect(updated.name).toBe('CRUD User Updated');
  expect(updated.role).toBe('lead');

  const rowAfterUpdate = await dbGet<UserRow>(
    'SELECT id, name, role FROM users WHERE id = ?',
    [created.id]
  );
  assertApiMatchesDbUser(updated, rowAfterUpdate);

  const delRes = await request.delete(`${API_BASE}/api/users/${created.id}`);
  expect(delRes.status()).toBe(204);

  const rowAfterDelete = await dbGet<UserRow>(
    'SELECT id, name, role FROM users WHERE id = ?',
    [created.id]
  );
  expect(rowAfterDelete).toBeUndefined();

  const all = await dbAll<UserRow>('SELECT id, name, role FROM users');
  expect(all.length, 'после DELETE в БД не должно остаться пользователей').toBe(0);
});

test.describe('Негативные сценарии', () => {
  test('null в обязательном поле name → 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/users`, {
      data: { name: null, role: 'x' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(400);
    const j = await res.json();
    expect(j.error).toBeTruthy();
  });

  test('строка граничной длины: имя > 500 символов → 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/users`, {
      data: { name: 'n'.repeat(501), role: 'ok' },
    });
    expect(res.status()).toBe(400);
  });

  test('попытка SQL-инъекции в name сохраняется как литерал; таблица не повреждена', async ({
    request,
  }) => {
    const poison = "Robert'); DELETE FROM users;--";
    const res = await request.post(`${API_BASE}/api/users`, {
      data: { name: poison, role: 'safe' },
    });
    expect(res.status()).toBe(201);
    const apiUser = (await res.json()) as UserRow;

    const row = await dbGet<UserRow>(
      'SELECT id, name, role FROM users WHERE id = ?',
      [apiUser.id]
    );
    assertApiMatchesDbUser(apiUser, row);
    expect(row!.name).toBe(poison);

    const count = await dbAll<UserRow>('SELECT id FROM users');
    expect(count.length).toBe(1);
  });
});
