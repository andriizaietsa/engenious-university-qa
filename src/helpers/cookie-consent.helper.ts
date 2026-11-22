import type { Page } from '@playwright/test';

/**
 * The site shows a modal "We value your privacy" cookie dialog on first visit.
 * While it is open, the rest of the page is aria-hidden, so role-based locators can't find anything.
 *
 * `page.addLocatorHandler` is Playwright's recommended way to deal with overlays that appear at
 * unpredictable moments. Before every action or auto-retrying assertion, Playwright checks for the
 * dialog and dismisses it if it is present.
 * https://playwright.dev/docs/api/class-page#page-add-locator-handler
 */
export async function autoAcceptCookieConsent(page: Page): Promise<void> {
  const acceptAllButton = page.getByRole('button', { name: 'Accept all' });
  await page.addLocatorHandler(acceptAllButton, async (button) => {
    await button.click();
  });
}
