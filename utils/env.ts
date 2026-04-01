export const ENV = {
  baseUrl: process.env.BASE_URL ?? 'https://example.com',
  apiUrl: process.env.API_URL ?? 'https://api.example.com',
  username: process.env.USERNAME ?? '',
  password: process.env.PASSWORD ?? '',
  defaultTimeout: Number(process.env.DEFAULT_TIMEOUT ?? 30_000),
} as const;
