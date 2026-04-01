export const ENV = {
  baseUrl: process.env.BASE_URL ?? 'https://app-eu1.hubspot.com',
  apiUrl: process.env.API_URL ?? 'https://api.example.com',
  username: process.env.USERNAME ?? '',
  password: process.env.PASSWORD ?? '',
  otpSecret: process.env.OTP_SECRET ?? '',
  portalId: process.env.PORTAL_ID ?? '148143933',
  defaultTimeout: Number(process.env.DEFAULT_TIMEOUT ?? 30_000),
} as const;
