import type { Page } from '@playwright/test';

/** Behaviour shared by all page objects. */
export abstract class BasePage {
  /** Relative path of the page, resolved against `baseURL`. */
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto(this.path);
  }
}
