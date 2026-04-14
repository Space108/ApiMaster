/**
 * Внешний DummyJSON + вторичная фиксация ответа в SQLite (test_audit) для контроля целостности снимка.
 * Разработчик проекта: [Space108] — AI Developer & AI Full-stack Quality
 */

import { test, expect } from '@playwright/test';
import { persistAndVerifyApiSnapshot } from './helpers/db-audit';
import { assertMatchesSchema } from './helpers/json-schema';
import {
  authLoginSuccessSchema,
  authMeSchema,
  cartByIdSchema,
  cartsListSchema,
  productsListSchema,
} from './schemas/dummyjson.schemas';

const BASE = 'https://dummyjson.com';

test.describe('Каталог (products)', () => {
  test('GET /products — статус 200, Content-Type JSON, тело по схеме', async ({ request }) => {
    const response = await request.get(`${BASE}/products`);

    expect(response.status(), 'ожидаем успешный ответ каталога').toBe(200);
    expect(response.headers()['content-type'] ?? '').toMatch(/application\/json/i);

    const body = await response.json();
    assertMatchesSchema(body, productsListSchema, 'GET /products');
    await persistAndVerifyApiSnapshot('dummyjson GET /products', body);
  });

  test('GET /products/0 — несуществующий товар,404', async ({ request }) => {
    const response = await request.get(`${BASE}/products/0`);
    expect(response.status()).toBe(404);
  });
});

test.describe('Корзина (carts)', () => {
  test('GET /carts — статус 200, заголовки и схема списка', async ({ request }) => {
    const response = await request.get(`${BASE}/carts`);

    expect(response.status(), 'список корзин доступен').toBe(200);
    expect(response.headers()['content-type'] ?? '').toMatch(/application\/json/i);

    const body = await response.json();
    assertMatchesSchema(body, cartsListSchema, 'GET /carts');
    await persistAndVerifyApiSnapshot('dummyjson GET /carts', body);
  });

  test('GET /carts/1 — одна корзина соответствует схеме', async ({ request }) => {
    const response = await request.get(`${BASE}/carts/1`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    assertMatchesSchema(body, cartByIdSchema, 'GET /carts/1');
    await persistAndVerifyApiSnapshot('dummyjson GET /carts/1', body);
  });

  test('GET /carts/999999 — несуществующая корзина, 404', async ({ request }) => {
    const response = await request.get(`${BASE}/carts/999999`);
    expect(response.status()).toBe(404);
  });
});

test.describe('Авторизация и заголовки', () => {
  test('GET /auth/me без токена — 401', async ({ request }) => {
    const response = await request.get(`${BASE}/auth/me`);
    expect(response.status()).toBe(401);
  });

  test('POST /auth/login с неверными данными — 400', async ({ request }) => {
    const response = await request.post(`${BASE}/auth/login`, {
      data: { username: '__invalid__', password: '__invalid__' },
    });
    expect(response.status()).toBe(400);
    expect(response.headers()['content-type'] ?? '').toMatch(/application\/json/i);
  });

  test('Bearer-токен: login → /auth/me — 200, схемы ответов и Authorization', async ({
    request,
  }) => {
    const loginRes = await request.post(`${BASE}/auth/login`, {
      data: {
        username: 'emilys',
        password: 'emilyspass',
      },
    });

    expect(loginRes.status()).toBe(200);
    expect(loginRes.headers()['content-type'] ?? '').toMatch(/application\/json/i);

    const loginBody = await loginRes.json();
    assertMatchesSchema(loginBody, authLoginSuccessSchema, 'POST /auth/login');

    const token = loginBody.accessToken as string;
    expect(token.length).toBeGreaterThan(20);

    const loginForAudit = {
      ...loginBody,
      accessToken: '[REDACTED]',
      refreshToken: '[REDACTED]',
    };
    await persistAndVerifyApiSnapshot('dummyjson POST /auth/login (tokens redacted)', loginForAudit);

    const meRes = await request.get(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(meRes.status()).toBe(200);
    expect(meRes.headers()['content-type'] ?? '').toMatch(/application\/json/i);

    const meBody = await meRes.json();
    assertMatchesSchema(meBody, authMeSchema, 'GET /auth/me');
    expect(meBody.username).toBe('emilys');
    await persistAndVerifyApiSnapshot('dummyjson GET /auth/me', meBody);
  });
});
