import type { Locator, Page } from '@playwright/test';

/** Side drawer opened from the header "open drawer" button. It is only available to authenticated users. */
export class UserMenu {
  readonly openButton: Locator;
  readonly drawer: Locator;
  readonly userName: Locator;
  readonly logoutButton: Locator;

  constructor(private readonly page: Page) {
    this.openButton = page.getByRole('banner').getByRole('button', { name: 'open drawer' });
    this.drawer = page.locator('.MuiDrawer-paper');
    this.userName = this.drawer.getByRole('heading', { level: 3 });
    this.logoutButton = this.drawer.getByRole('button', { name: 'Logout' });
  }

  async open(): Promise<void> {
    await this.openButton.click();
  }

  async logout(): Promise<void> {
    await this.open();
    await this.logoutButton.click();
  }
}
