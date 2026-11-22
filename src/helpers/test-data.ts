import { env } from '../config/env';

export type Credentials = { email: string; password: string };

export const validUser = (): Credentials => ({
  email: env.userEmail,
  password: env.userPassword,
});

/** A unique, non-existent email for each call, so it never matches a real account. */
export const unregisteredEmail = (): string => `not.registered.qa.${Date.now()}@example.com`;

export const WRONG_PASSWORD = 'WrongPass123!';
export const MALFORMED_EMAIL = 'invalid-email';

/** UI copy the tests assert against. Keeping it in one place makes text changes a one-line fix. */
export const Messages = {
  invalidCredentials: 'Invalid credentials!',
  invalidEmail: 'Invalid email address',
  passwordRequired: 'Password is required',
} as const;

export const Routes = {
  home: '/',
  login: '/login',
  courses: '/courses',
  profile: '/profile',
} as const;
