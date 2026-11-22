# Engenious University: Login QA Assessment

This repo contains P0 manual test cases and Playwright + TypeScript automation for the login flow on
[university.engenious.io](https://university.engenious.io/).

| Task | Deliverable |
| --- | --- |
| Task 1: manual QA | [`docs/manual-test-cases.md`](docs/manual-test-cases.md) has 5 P0 test cases (TC-01 to TC-05) with step-by-step expected results |
| Task 2: automation | [`tests/login.spec.ts`](tests/login.spec.ts) automates all 5 cases. TC-01 is the requested "Automated Login" scenario. |

## Tech stack

- [Playwright Test](https://playwright.dev/) with TypeScript, running on **Google Chrome only** (`channel: 'chrome'`)
- The Page Object Model, with page objects injected through Playwright **fixtures**
- `dotenv` for credentials, so no secrets live in the code
- GitHub Actions for CI

## Project structure

```
.
├── .github/workflows/playwright.yml   # CI pipeline
├── docs/manual-test-cases.md          # Task 1: manual P0 test cases
├── src/
│   ├── config/env.ts                  # Loads and validates environment variables
│   ├── fixtures/test.ts               # Custom `test` that injects page objects and handles the cookie banner
│   ├── helpers/
│   │   ├── auth.helper.ts             # Session cookie and login request helpers
│   │   ├── cookie-consent.helper.ts   # Auto-dismisses the cookie dialog (page.addLocatorHandler)
│   │   └── test-data.ts               # Credentials, test data, UI messages, routes
│   └── pages/
│       ├── BasePage.ts
│       ├── HomePage.ts
│       ├── LoginPage.ts
│       ├── CoursesPage.ts             # Dashboard shown after login
│       └── components/UserMenu.ts     # Header drawer with Logout
├── tests/login.spec.ts                # Task 2: automated tests
├── playwright.config.ts
└── .env.example                       # Template for local credentials
```

## Design decisions

- **Page objects** hold the locators and user actions only. Assertions live in the specs.
- **Fixtures** (`src/fixtures/test.ts`) construct the page objects, so tests stay short and declarative.
- **User-facing locators** (`getByRole` with an accessible name) follow
  [Playwright best practices](https://playwright.dev/docs/best-practices). CSS is used only for MUI helper text and toasts, which have no accessible role.
- **The cookie consent modal** sets the rest of the page to `aria-hidden`. A single `page.addLocatorHandler` in the fixture
  dismisses it whenever it shows up, so no test has to deal with it.
- **Soft, then hard assertions:** each test collects intermediate checks with `expect.soft` so a single run reports
  every broken expectation. The **final check is a hard `expect`** that decides pass or fail.
- **`test.step`** groups the TC-01 steps so the HTML report reads like the manual test case.
- **Tags:** every test is tagged `@P0`, and TC-01 is also tagged `@smoke`.

## Getting started

### Prerequisites

- Node.js 20 or later (LTS recommended)
- Google Chrome installed locally (`npx playwright install chrome` installs it if it is missing)
- A registered Engenious University account

### Install

```bash
git clone https://github.com/<your-github-username>/engenious-university-qa.git
cd engenious-university-qa
npm ci
npx playwright install chrome
```

### Configure credentials

```bash
cp .env.example .env
# then edit .env and fill in USER_EMAIL and USER_PASSWORD
```

`.env` is listed in `.gitignore` and must **never** be committed.

### Run tests

| Command | What it does |
| --- | --- |
| `npm test` | Run all tests headless |
| `npm run test:headed` | Run with a visible browser |
| `npm run test:ui` | Open Playwright UI mode |
| `npm run test:debug` | Step through with the Playwright Inspector |
| `npx playwright test --grep @smoke` | Run only the smoke test (TC-01) |
| `npm run report` | Open the latest HTML report |
| `npm run typecheck` | TypeScript type check |

On failure, Playwright keeps a **trace**, a **screenshot** and a **video** in `test-results/`.
Open a trace with `npx playwright show-trace <path-to-trace.zip>`.

## Continuous integration

`.github/workflows/playwright.yml` runs on every push to `main`, on every pull request to `main`, and on manual dispatch.
It installs dependencies, runs the type check, installs Chrome, runs the tests and uploads the HTML report
(plus traces when a test fails) as build artifacts.

The workflow needs two **repository secrets**:

| Secret | Value |
| --- | --- |
| `USER_EMAIL` | Test account email |
| `USER_PASSWORD` | Test account password |

To add them, go to **Settings → Secrets and variables → Actions → New repository secret**, or use the GitHub CLI:

```bash
gh secret set USER_EMAIL
gh secret set USER_PASSWORD
```

## Git workflow

### First-time setup

```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
```

### Working on a change

```bash
# 1. Start from an up-to-date main
git checkout main
git pull origin main

# 2. Create a feature branch
git checkout -b feature/<short-description>

# 3. Make changes and run the tests locally
npm run typecheck && npm test

# 4. Review and stage the changes (make sure .env is NOT listed)
git status
git add <files>

# 5. Commit with a descriptive message
git commit -m "Add login negative tests"

# 6. Push the branch
git push -u origin feature/<short-description>

# 7. Open a pull request (or use the GitHub web UI)
gh pr create --base main --title "Add login negative tests" --body "What changed and why"
```

CI runs automatically on the pull request. Merge it once the **Playwright Tests** check is green:

```bash
gh pr checks --watch     # follow the CI status
gh pr merge --squash     # merge when it is green
```

### Useful commands

| Command | Purpose |
| --- | --- |
| `git status` | Show changed and untracked files |
| `git diff` | Show unstaged changes |
| `git log --oneline -10` | Show recent history |
| `git restore <file>` | Discard local changes to a file |
| `git fetch && git rebase origin/main` | Update your branch with the latest main |
| `git check-ignore -v .env` | Confirm `.env` is ignored |

### If a secret was committed by mistake

1. **Rotate the password immediately.** Removing it from git does not remove it from forks or caches.
2. Remove the file from tracking with `git rm --cached .env`, then commit.
3. Rewrite history if needed, for example with [`git filter-repo`](https://github.com/newren/git-filter-repo).
