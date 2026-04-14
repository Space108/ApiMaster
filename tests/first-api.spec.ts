/**
 * Базовые контракты jsonplaceholder.typicode.com + JSON Schema.
 * Разработчик проекта: [Space108] — AI Developer & AI Full-stack Quality
 */
import { test, expect } from '@playwright/test';
import { assertMatchesSchema } from './helpers/json-schema';
import { postCreateResponseSchema, postSchema } from './schemas/jsonplaceholder.schemas';

test('Должен получить список постов от сервера', async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type'] ?? '').toMatch(/application\/json/i);

  const body = await response.json();
  assertMatchesSchema(body, postSchema, 'GET /posts/1');
  expect(body.id).toBe(1);
});

test('Должен создать новый пост на сервере', async ({ request }) => {
  const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
    data: {
      title: 'Пост Мишани',
      body: 'API это проще чем кажется',
      userId: 108,
    },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  assertMatchesSchema(body, postCreateResponseSchema, 'POST /posts');
  expect(body.title).toBe('Пост Мишани');
});

test('Должен удалить пост на сервере', async ({ request }) => {
  const response = await request.delete('https://jsonplaceholder.typicode.com/posts/1');

  expect(response.status()).toBe(200);
});
