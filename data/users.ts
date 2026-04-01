export interface User {
  username: string;
  password: string;
}

export const users: Record<string, User> = {
  standard: {
    username: process.env.USERNAME ?? 'standard_user',
    password: process.env.PASSWORD ?? 'secret_sauce',
  },
  admin: {
    username: 'admin_user',
    password: 'admin_pass',
  },
};
