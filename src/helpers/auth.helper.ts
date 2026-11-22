import type { BrowserContext, Cookie, Page } from '@playwright/test';

/** Session cookies issued by the backend after a successful login. */
export const AUTH_COOKIE_NAMES = ['eu_accessToken', 'eu_refreshToken'] as const;
export type AuthCookieName = (typeof AUTH_COOKIE_NAMES)[number];

export async function getAuthCookies(context: BrowserContext): Promise<Cookie[]> {
  const cookies = await context.cookies();
  return cookies.filter((c) => (AUTH_COOKIE_NAMES as readonly string[]).includes(c.name));
}

export async function getAuthCookie(context: BrowserContext, name: AuthCookieName): Promise<Cookie | undefined> {
  return (await getAuthCookies(context)).find((c) => c.name === name);
}

/** A context counts as authenticated when it holds the access-token cookie. */
export async function hasAccessToken(context: BrowserContext): Promise<boolean> {
  return (await getAuthCookie(context, 'eu_accessToken')) !== undefined;
}

/**
 * Counts login form submissions sent to the server. The app posts the form to `/login` as a Next.js
 * server action. The tests use this to prove that client-side validation blocks invalid input
 * before any network call is made.
 */
export function trackLoginRequests(page: Page): { readonly count: number } {
  let count = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/login') count++;
  });
  return {
    get count() {
      return count;
    },
  };
}
