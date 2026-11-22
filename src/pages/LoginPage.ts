import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Routes } from '../helpers/test-data';

/** Login / Registration page: https://university.engenious.io/login */
export class LoginPage extends BasePage {
  protected readonly path = Routes.login;

  readonly loginTab: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  /** Server-side errors such as "Invalid credentials!" are shown as react-toastify notifications. */
  readonly errorToast: Locator;

  constructor(page: Page) {
    super(page);
    const main = page.getByRole('main');
    this.loginTab = main.getByRole('link', { name: 'Login', exact: true });
    this.emailInput = main.getByRole('textbox', { name: 'Email' });
    this.passwordInput = main.getByRole('textbox', { name: 'Password' });
    this.loginButton = main.getByRole('button', { name: 'Login', exact: true });
    this.errorToast = page.locator('.Toastify__toast--error');
  }

  async openLoginTab(): Promise<void> {
    await this.loginTab.click();
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }
}
