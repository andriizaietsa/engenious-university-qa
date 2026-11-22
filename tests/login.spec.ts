import { test, expect } from '../src/fixtures/test';
import { getAuthCookie, getAuthCookies, hasAccessToken, trackLoginRequests } from '../src/helpers/auth.helper';
import {
  MALFORMED_EMAIL,
  Messages,
  Routes,
  WRONG_PASSWORD,
  unregisteredEmail,
  validUser,
  type Credentials,
} from '../src/helpers/test-data';

/**
 * P0 login flow coverage. Manual test cases: docs/manual-test-cases.md
 *
 * Assertion style: intermediate checks use `expect.soft` so one run reports every broken
 * expectation. The final check in each test is a hard `expect` that decides pass/fail.
 */
const softExpect = expect.configure({ soft: true });

test.describe('Login flow (P0)', { tag: '@P0' }, () => {
  test('TC-01: user logs in with valid credentials and lands on the dashboard', { tag: '@smoke' }, async ({
    page,
    homePage,
    loginPage,
    coursesPage,
  }) => {
    const user = validUser();

    await test.step('Navigate to the Engenious University home page', async () => {
      await homePage.open();
      await expect.soft(page).toHaveTitle(/EnGenious University/);
      await expect.soft(homePage.signInLink).toBeVisible();
    });

    await test.step('Click the "Sign in" button', async () => {
      await homePage.clickSignIn();
      await expect.soft(page).toHaveURL(Routes.login);
      await expect.soft(loginPage.loginTab).toBeVisible();
    });

    await test.step('Click the "Log in" tab', async () => {
      await loginPage.openLoginTab();
      await expect.soft(page).toHaveURL(Routes.login);
      await expect.soft(loginPage.emailInput).toBeVisible();
      await expect.soft(loginPage.passwordInput).toBeVisible();
    });

    await test.step('Input Email in the email field', async () => {
      await loginPage.fillEmail(user.email);
      await expect.soft(loginPage.emailInput).toHaveValue(user.email);
    });

    await test.step('Input Password in the password field', async () => {
      await loginPage.fillPassword(user.password);
      await expect.soft(loginPage.passwordInput).toHaveValue(user.password);
      await expect.soft(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });

    await test.step('Click the "Login" button', async () => {
      await loginPage.submit();
    });

    await test.step('Verify the user is logged in and redirected to the dashboard', async () => {
      await expect.soft(page).toHaveURL(Routes.courses);
      await expect.soft(loginPage.errorToast).toBeHidden();
      await expect.soft(coursesPage.pageHeading).toBeVisible();
      await expect.soft(coursesPage.availableCoursesHeading).toBeVisible();
      await expect.soft(coursesPage.userMenu.openButton).toBeVisible();
      // Hard assertion: the personal "<Name>'s courses" section is only rendered for an authenticated user.
      await expect(coursesPage.myCoursesHeading).toBeVisible();
    });
  });

  const invalidCredentials: { title: string; credentials: () => Credentials }[] = [
    { title: 'wrong password', credentials: () => ({ email: validUser().email, password: WRONG_PASSWORD }) },
    { title: 'unregistered email', credentials: () => ({ email: unregisteredEmail(), password: WRONG_PASSWORD }) },
  ];

  for (const { title, credentials } of invalidCredentials) {
    test(`TC-02: login is rejected with a generic error for ${title}`, async ({ page, context, loginPage }) => {
      await loginPage.open();
      await loginPage.login(credentials());

      // The same generic text for both data sets means the response doesn't reveal which accounts exist.
      await expect.soft(loginPage.errorToast).toHaveText(Messages.invalidCredentials);
      await expect.soft(page).toHaveURL(Routes.login);
      await expect.soft(loginPage.loginButton).toBeVisible();
      expect(await getAuthCookies(context), 'no session cookies must be issued').toHaveLength(0);
    });
  }

  test('TC-03 (A): client-side validation blocks submit with empty email and password', async ({
    page,
    loginPage,
  }) => {
    await loginPage.open();
    const loginRequests = trackLoginRequests(page);

    await loginPage.login({ email: '', password: '' });

    await expect.soft(loginPage.emailError).toHaveText(Messages.invalidEmail);
    await expect.soft(loginPage.emailInput).toHaveAttribute('aria-invalid', 'true');
    await expect.soft(loginPage.passwordError).toHaveText(Messages.passwordRequired);
    await expect.soft(loginPage.passwordInput).toHaveAttribute('aria-invalid', 'true');
    await expect.soft(loginPage.errorToast).toBeHidden();
    await expect.soft(page).toHaveURL(Routes.login);
    expect(loginRequests.count, 'invalid form must not be sent to the server').toBe(0);
  });

  test('TC-03 (B): native email validation blocks submit with malformed email', async ({ page, loginPage }) => {
    await loginPage.open();
    const loginRequests = trackLoginRequests(page);

    await loginPage.login({ email: MALFORMED_EMAIL, password: WRONG_PASSWORD });

    // The input is type="email", so Chrome's constraint validation stops the submit before React handles it.
    expect.soft(await loginPage.isEmailValid(), 'email input fails constraint validation').toBe(false);
    expect.soft(await loginPage.getEmailValidationMessage()).toContain("'@'");
    await expect.soft(loginPage.errorToast).toBeHidden();
    await expect.soft(page).toHaveURL(Routes.login);
    expect(loginRequests.count, 'invalid form must not be sent to the server').toBe(0);
  });

  test('TC-04: password is masked and session cookies are HttpOnly and Secure', async ({
    page,
    context,
    loginPage,
  }) => {
    const user = validUser();
    await loginPage.open();

    await test.step('Password is masked by default', async () => {
      await expect.soft(loginPage.passwordInput).toHaveAttribute('type', 'password');
      await expect.soft(loginPage.passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    await test.step('Visibility toggle reveals and hides the password', async () => {
      await loginPage.fillPassword(user.password);
      await loginPage.togglePasswordVisibility();
      await expect.soft(loginPage.passwordInput).toHaveAttribute('type', 'text');
      await loginPage.togglePasswordVisibility();
      await expect.soft(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });

    await test.step('Log in and verify credentials are not exposed in the URL', async () => {
      await loginPage.fillEmail(user.email);
      await loginPage.submit();
      await page.waitForURL(Routes.courses);
      expect.soft(page.url()).not.toContain(encodeURIComponent(user.email));
      expect.soft(page.url()).not.toContain(user.email);
      expect.soft(page.url()).not.toContain(user.password);
    });

    await test.step('Session cookies are HttpOnly and Secure', async () => {
      const accessToken = await getAuthCookie(context, 'eu_accessToken');
      const refreshToken = await getAuthCookie(context, 'eu_refreshToken');
      expect.soft(accessToken, 'access token cookie is set').toBeDefined();
      expect.soft(refreshToken, 'refresh token cookie is set').toBeDefined();
      expect.soft(accessToken?.httpOnly, 'access token is HttpOnly').toBe(true);
      expect.soft(accessToken?.secure, 'access token is Secure').toBe(true);
      expect.soft(refreshToken?.httpOnly, 'refresh token is HttpOnly').toBe(true);
      expect.soft(refreshToken?.secure, 'refresh token is Secure').toBe(true);

      const jsVisibleCookies = await page.evaluate(() => document.cookie);
      expect(jsVisibleCookies, 'auth tokens must not be readable from JavaScript').not.toMatch(
        /eu_(access|refresh)Token/,
      );
    });
  });

  test('TC-05: protected page requires login and logout ends the session', async ({
    page,
    context,
    loginPage,
    coursesPage,
  }) => {
    const user = validUser();

    await test.step('Unauthenticated user is redirected from /profile to login', async () => {
      await page.goto(Routes.profile);
      await expect.soft(page).toHaveURL(/\/login\?next=%2Fprofile/);
      await expect.soft(loginPage.loginButton).toBeVisible();
    });

    await test.step('Log in', async () => {
      await loginPage.login(user);
      await expect.soft(page).not.toHaveURL(/\/login/);
      await softExpect.poll(() => hasAccessToken(context), { message: 'session is created' }).toBe(true);
    });

    await test.step('Log out from the user menu', async () => {
      await coursesPage.open();
      await coursesPage.userMenu.open();
      await expect.soft(coursesPage.userMenu.userName).toBeVisible();
      await coursesPage.userMenu.logoutButton.click();
      await softExpect
        .poll(() => hasAccessToken(context), { message: 'access token is removed after logout' })
        .toBe(false);
    });

    await test.step('Protected page is not reachable after logout', async () => {
      await page.goto(Routes.profile);
      await expect(page).toHaveURL(/\/login\?next=%2Fprofile/);
    });
  });
});
