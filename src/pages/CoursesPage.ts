import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { UserMenu } from './components/UserMenu';
import { Routes } from '../helpers/test-data';

/** Landing page after a successful login (the user's dashboard): https://university.engenious.io/courses */
export class CoursesPage extends BasePage {
  protected readonly path = Routes.courses;

  readonly pageHeading: Locator;
  /** Personal section, for example "John's courses". It is rendered only for a logged-in user. */
  readonly myCoursesHeading: Locator;
  readonly availableCoursesHeading: Locator;
  readonly userMenu: UserMenu;

  constructor(page: Page) {
    super(page);
    const main = page.getByRole('main');
    this.pageHeading = main.getByRole('heading', { level: 1, name: 'Boost your career now' });
    this.myCoursesHeading = main.getByRole('heading', { level: 2, name: /'s courses$/ });
    this.availableCoursesHeading = main.getByRole('heading', { level: 2, name: 'Available courses' });
    this.userMenu = new UserMenu(page);
  }
}
