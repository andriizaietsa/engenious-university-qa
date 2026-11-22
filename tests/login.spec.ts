import { test, expect } from '../src/fixtures/test';
import { Routes, validUser } from '../src/helpers/test-data';

/**
 * Task 2: Automated Login.
 * Precondition: the user is already registered, and their credentials are in .env (USER_EMAIL / USER_PASSWORD).
 * Browser: Chrome only (see playwright.config.ts).
 *
 * Assertion style: intermediate checks use `expect.soft`, so one run reports every broken expectation.
 * The final check is a single hard `expect` that decides whether the test passes.
 */
test.describe('Login', () => {
  test('Automate the login process on Engenious University', async ({ page, homePage, loginPage, coursesPage }) => {
    const user = validUser();

    // "Open the Chrome browser" is handled by Playwright: the only configured project runs branded Google Chrome.

    await test.step('Navigate to the Engenious University page', async () => {
      await homePage.open();
      await expect.soft(page).toHaveTitle(/EnGenious University/);
      await expect.soft(homePage.signInLink).toBeVisible();
    });

    await test.step('Click on the "Sign In" button', async () => {
      await homePage.clickSignIn();
      await expect.soft(page).toHaveURL(Routes.login);
      await expect.soft(loginPage.loginTab).toBeVisible();
    });

    await test.step('Click on the "Log in" button', async () => {
      await loginPage.openLoginTab();
      await expect.soft(loginPage.emailInput).toBeVisible();
      await expect.soft(loginPage.passwordInput).toBeVisible();
    });

    await test.step('Enter valid login credentials (Email and Password)', async () => {
      await test.step('Input Email in the email field', async () => {
        await loginPage.fillEmail(user.email);
        await expect.soft(loginPage.emailInput).toHaveValue(user.email);
      });

      await test.step('Input Password in the password field', async () => {
        await loginPage.fillPassword(user.password);
        await expect.soft(loginPage.passwordInput).toHaveValue(user.password);
      });
    });

    await test.step('Click on the "Login" button', async () => {
      await loginPage.submit();
    });

    await test.step('Verify that the user is successfully logged in and redirected to the dashboard', async () => {
      await expect.soft(page).toHaveURL(Routes.courses);
      await expect.soft(loginPage.errorToast).toBeHidden();
      await expect.soft(coursesPage.userMenuButton).toBeVisible();
      // Hard assertion: the personal "<Name>'s courses" section appears on the dashboard only after login.
      await expect(coursesPage.myCoursesHeading).toBeVisible();
    });
  });
});
