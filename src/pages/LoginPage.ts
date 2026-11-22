import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Routes, type Credentials } from '../helpers/test-data';

/** Login / Registration page: https://university.engenious.io/login */
export class LoginPage extends BasePage {
  protected readonly path = Routes.login;

  readonly registrationTab: Locator;
  readonly loginTab: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly togglePasswordVisibilityButton: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    super(page);
    const main = page.getByRole('main');
    this.registrationTab = main.getByRole('link', { name: 'Registration', exact: true });
    this.loginTab = main.getByRole('link', { name: 'Login', exact: true });
    this.emailInput = main.getByRole('textbox', { name: 'Email' });
    this.passwordInput = main.getByRole('textbox', { name: 'Password' });
    this.togglePasswordVisibilityButton = main.getByRole('button', { name: 'toggle password visibility' });
    this.loginButton = main.getByRole('button', { name: 'Login', exact: true });
    this.forgotPasswordLink = main.getByRole('link', { name: 'Forgot password' });

    // MUI renders the inline validation message as helper text inside the field's FormControl.
    this.emailError = this.helperTextFor('email');
    this.passwordError = this.helperTextFor('password');

    // Server-side errors are shown as react-toastify notifications.
    this.errorToast = page.locator('.Toastify__toast--error');
  }

  /** Inline validation message rendered under the given input. */
  private helperTextFor(inputName: 'email' | 'password'): Locator {
    return this.page
      .locator('.MuiFormControl-root')
      .filter({ has: this.page.locator(`input[name="${inputName}"]`) })
      .locator('.MuiFormHelperText-root');
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

  async togglePasswordVisibility(): Promise<void> {
    await this.togglePasswordVisibilityButton.click();
  }

  /** Browser (HTML5) constraint validation state of the email input. */
  async isEmailValid(): Promise<boolean> {
    return this.emailInput.evaluate((input: HTMLInputElement) => input.validity.valid);
  }

  /** Native validation message the browser shows in its tooltip, for example "Please include an '@'...". */
  async getEmailValidationMessage(): Promise<string> {
    return this.emailInput.evaluate((input: HTMLInputElement) => input.validationMessage);
  }

  /** Fills the form and submits it. Does not wait for any outcome, so it works for positive and negative tests. */
  async login({ email, password }: Credentials): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }
}
