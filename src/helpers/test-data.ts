import { env } from '../config/env';

export type Credentials = { email: string; password: string };

/** The registered user from the precondition. Credentials come from .env (USER_EMAIL / USER_PASSWORD). */
export const validUser = (): Credentials => ({
  email: env.userEmail,
  password: env.userPassword,
});

export const Routes = {
  home: '/',
  login: '/login',
  courses: '/courses',
} as const;
