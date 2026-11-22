import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Routes } from '../helpers/test-data';

/** Public landing page: https://university.engenious.io/ */
export class HomePage extends BasePage {
  protected readonly path = Routes.home;

  readonly mainNavigation: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    super(page);
    this.mainNavigation = page.getByRole('navigation', { name: 'Main' });
    this.signInLink = this.mainNavigation.getByRole('link', { name: 'Sign in' });
  }

  async clickSignIn(): Promise<void> {
    await this.signInLink.click();
  }
}
