/** JSON Schema for https://jsonplaceholder.typicode.com posts */

export const postSchema = {
  type: 'object',
  required: ['userId', 'id', 'title', 'body'],
  additionalProperties: true,
  properties: {
    userId: { type: 'number' },
    id: { type: 'number' },
    title: { type: 'string' },
    body: { type: 'string' },
  },
} as const;

export const postCreateResponseSchema = {
  type: 'object',
  required: ['title', 'body', 'userId', 'id'],
  additionalProperties: true,
  properties: {
    id: { type: 'number' },
    title: { type: 'string' },
    body: { type: 'string' },
    userId: { type: 'number' },
  },
} as const;
