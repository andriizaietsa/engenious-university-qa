import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Routes } from '../helpers/test-data';

/** Landing page after a successful login (the user's dashboard): https://university.engenious.io/courses */
export class CoursesPage extends BasePage {
  protected readonly path = Routes.courses;

  /** Personal section, for example "John's courses". It is rendered only for a logged-in user. */
  readonly myCoursesHeading: Locator;
  /** Header button that opens the user drawer. It is only shown to authenticated users. */
  readonly userMenuButton: Locator;

  constructor(page: Page) {
    super(page);
    this.myCoursesHeading = page.getByRole('main').getByRole('heading', { level: 2, name: /'s courses$/ });
    this.userMenuButton = page.getByRole('banner').getByRole('button', { name: 'open drawer' });
  }
}
