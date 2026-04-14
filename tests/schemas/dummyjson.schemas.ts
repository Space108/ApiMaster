/** JSON Schema (draft-07) fragments for https://dummyjson.com */

export const productsListSchema = {
  type: 'object',
  required: ['products', 'total', 'skip', 'limit'],
  additionalProperties: true,
  properties: {
    products: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['id', 'title', 'price'],
        additionalProperties: true,
        properties: {
          id: { type: 'number' },
          title: { type: 'string', minLength: 1 },
          price: { type: 'number' },
          discountPercentage: { type: 'number' },
          rating: { type: 'number' },
          stock: { type: 'number' },
          brand: { type: 'string' },
          category: { type: 'string' },
        },
      },
    },
    total: { type: 'number', minimum: 0 },
    skip: { type: 'number', minimum: 0 },
    limit: { type: 'number', minimum: 1 },
  },
} as const;

export const cartsListSchema = {
  type: 'object',
  required: ['carts', 'total', 'skip', 'limit'],
  additionalProperties: true,
  properties: {
    carts: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['id', 'products', 'total', 'userId', 'totalProducts', 'totalQuantity'],
        additionalProperties: true,
        properties: {
          id: { type: 'number' },
          total: { type: 'number' },
          discountedTotal: { type: 'number' },
          userId: { type: 'number' },
          totalProducts: { type: 'number', minimum: 0 },
          totalQuantity: { type: 'number', minimum: 0 },
          products: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'title', 'price', 'quantity'],
              additionalProperties: true,
              properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                price: { type: 'number' },
                quantity: { type: 'number', minimum: 0 },
                total: { type: 'number' },
                discountPercentage: { type: 'number' },
                discountedTotal: { type: 'number' },
                thumbnail: { type: 'string' },
              },
            },
          },
        },
      },
    },
    total: { type: 'number', minimum: 0 },
    skip: { type: 'number', minimum: 0 },
    limit: { type: 'number', minimum: 1 },
  },
} as const;

export const cartByIdSchema = {
  type: 'object',
  required: ['id', 'products', 'total', 'userId', 'totalProducts', 'totalQuantity'],
  additionalProperties: true,
  properties: {
    id: { type: 'number' },
    total: { type: 'number' },
    discountedTotal: { type: 'number' },
    userId: { type: 'number' },
    totalProducts: { type: 'number', minimum: 0 },
    totalQuantity: { type: 'number', minimum: 0 },
    products: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'price', 'quantity'],
        additionalProperties: true,
        properties: {
          id: { type: 'number' },
          title: { type: 'string' },
          price: { type: 'number' },
          quantity: { type: 'number', minimum: 0 },
        },
      },
    },
  },
} as const;

export const authLoginSuccessSchema = {
  type: 'object',
  required: ['accessToken', 'refreshToken', 'id', 'username', 'email'],
  additionalProperties: true,
  properties: {
    accessToken: { type: 'string', minLength: 20 },
    refreshToken: { type: 'string', minLength: 20 },
    id: { type: 'number' },
    username: { type: 'string' },
    email: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    gender: { type: 'string' },
    image: { type: 'string' },
  },
} as const;

export const authMeSchema = {
  type: 'object',
  required: ['id', 'username', 'email', 'firstName', 'lastName'],
  additionalProperties: true,
  properties: {
    id: { type: 'number' },
    username: { type: 'string' },
    email: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    gender: { type: 'string' },
  },
} as const;
