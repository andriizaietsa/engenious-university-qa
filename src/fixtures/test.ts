import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { CoursesPage } from '../pages/CoursesPage';
import { autoAcceptCookieConsent } from '../helpers/cookie-consent.helper';

type PageObjects = {
  homePage: HomePage;
  loginPage: LoginPage;
  coursesPage: CoursesPage;
};

/**
 * Custom test that injects page objects through fixtures, so specs don't construct them by hand.
 * It also overrides the built-in `page` fixture to auto-dismiss the cookie consent dialog.
 * https://playwright.dev/docs/test-fixtures
 */
export const test = base.extend<PageObjects>({
  page: async ({ page }, use) => {
    await autoAcceptCookieConsent(page);
    await use(page);
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  coursesPage: async ({ page }, use) => {
    await use(new CoursesPage(page));
  },
});

export { expect };
