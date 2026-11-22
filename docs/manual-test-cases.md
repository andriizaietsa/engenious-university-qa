# Login Flow – P0 Test Cases

**Application under test:** https://university.engenious.io/
**Feature:** Login with email and password
**Priority:** P0. If any of these fail, release is blocked.
**Browser:** Google Chrome (latest stable), desktop 1280×720 or larger
**Author / date:** QA, 2026-11-22

## Test data

| Key | Value |
| --- | --- |
| `VALID_EMAIL` | Registered user's email (stored in `.env` as `USER_EMAIL`) |
| `VALID_PASSWORD` | Registered user's password (stored in `.env` as `USER_PASSWORD`) |
| `WRONG_PASSWORD` | `WrongPass123!` |
| `UNREGISTERED_EMAIL` | `not.registered.qa.<timestamp>@example.com` |
| `MALFORMED_EMAIL` | `invalid-email` |

## Common precondition

- A user is registered on Engenious University and their credentials are known.
- A fresh browser session (no auth cookies). Use incognito or clear cookies.
- If the cookie consent dialog ("We value your privacy") appears, click **Accept all**.

## Traceability / coverage

| ID | Title | Type | Automation |
| --- | --- | --- | --- |
| TC-01 | Successful login with valid credentials | Functional, positive | Automated (Task 2): `tests/login.spec.ts` › "Automate the login process on Engenious University" |
| TC-02 | Login is rejected for invalid credentials | Functional, negative / Security | Manual |
| TC-03 | Client-side validation of empty and malformed input | Functional, negative | Manual |
| TC-04 | Password field and session cookies are protected | Security | Manual |
| TC-05 | Logged-out user cannot open /profile, before login or after logout | Security / Access control | Manual |

---

## TC-01: Successful login with valid credentials

**Priority:** P0 | **Type:** Positive | **Automated:** Yes (Task 2)
**Precondition:** Common precondition. The user is logged out.

| # | Step | Expected result |
| --- | --- | --- |
| 1 | Open Chrome and navigate to `https://university.engenious.io/` | Home page loads. Title contains "EnGenious University". The **Sign in** link is visible in the header. |
| 2 | Click **Sign in** | User is redirected to `/login`. The **Registration** and **Login** tabs, the **Email** and **Password** fields and the **Login** button are displayed. |
| 3 | Click the **Login** tab | The login form stays active (URL `/login`). |
| 4 | Enter `VALID_EMAIL` in the **Email** field | The value is shown in the field and no validation error appears. |
| 5 | Enter `VALID_PASSWORD` in the **Password** field | The value is masked (`•••`) and no validation error appears. |
| 6 | Click **Login** | No error toast appears. The user is redirected to the landing page `/courses`. |
| 7 | Verify the dashboard | The heading **"<FirstName>'s courses"** (for example, "John's courses") and the **"Available courses"** section are visible. The header shows the user menu (**open drawer**), and the **Sign in** link is no longer shown. |

**Postcondition:** The user is logged in. Log out to restore state.

---

## TC-02: Login is rejected for invalid credentials

**Priority:** P0 | **Type:** Negative / Security | **Automated:** No (manual)
**Precondition:** Common precondition. Open `https://university.engenious.io/login`.

Run once per data set:

| Data set | Email | Password |
| --- | --- | --- |
| A: wrong password | `VALID_EMAIL` | `WRONG_PASSWORD` |
| B: unregistered email | `UNREGISTERED_EMAIL` | `WRONG_PASSWORD` |

| # | Step | Expected result |
| --- | --- | --- |
| 1 | Enter the email from the data set in **Email** | The value is accepted with no inline error. |
| 2 | Enter the password from the data set in **Password** | The value is masked. |
| 3 | Click **Login** | An error toast **"Invalid credentials!"** is displayed. |
| 4 | Compare the message for data sets A and B | The message is **identical** for both, so it does not reveal whether the account exists (no user enumeration). |
| 5 | Check the URL and session | The user stays on `/login`. No `eu_accessToken` or `eu_refreshToken` cookie is set. The dashboard is not accessible. |

---

## TC-03: Client-side validation of empty and malformed input

**Priority:** P0 | **Type:** Negative | **Automated:** No (manual)
**Precondition:** Common precondition. Open `https://university.engenious.io/login`.

| Data set | Email | Password | Expected validation |
| --- | --- | --- | --- |
| A: empty form | *(empty)* | *(empty)* | Inline app errors: Email shows **"Invalid email address"**; Password shows **"Password is required"**. Both fields are highlighted red (`aria-invalid="true"`). |
| B: malformed email | `MALFORMED_EMAIL` | `WRONG_PASSWORD` | Native browser validation (the input is `type="email"`): a Chrome tooltip says *"Please include an '@' in the email address..."* and the field is `:invalid`. |

| # | Step | Expected result |
| --- | --- | --- |
| 1 | Fill (or leave empty) **Email** and **Password** as per the data set | The fields show the entered values. |
| 2 | Click **Login** | The validation from the data set table is shown. The form is **not** submitted: no request goes to the server and no toast appears. |
| 3 | Check the URL | The user stays on `/login` and is not authenticated. |

---

## TC-04: Password field and session cookies are protected

**Priority:** P0 | **Type:** Security | **Automated:** No (manual)
**Precondition:** Common precondition. Open `https://university.engenious.io/login`.

| # | Step | Expected result |
| --- | --- | --- |
| 1 | Inspect the **Password** field | The input is `type="password"` and the characters are masked. It has `autocomplete="current-password"`. |
| 2 | Enter `VALID_PASSWORD`, then click **toggle password visibility** | The password becomes readable (`type="text"`). |
| 3 | Click **toggle password visibility** again | The password is masked again (`type="password"`). |
| 4 | Enter `VALID_EMAIL` and click **Login** | The login succeeds and the user lands on `/courses`. |
| 5 | Check the URL and browser history | The email and password do **not** appear in the URL or query string. |
| 6 | Open DevTools › Application › Cookies | The `eu_accessToken` and `eu_refreshToken` cookies are present with the **HttpOnly** and **Secure** flags. They cannot be read through `document.cookie`. |

---

## TC-05: Logged-out user cannot open /profile, before login or after logout

**Priority:** P0 | **Type:** Security / Access control | **Automated:** No (manual)
**Precondition:** Common precondition. The user is logged out.

| # | Step | Expected result |
| --- | --- | --- |
| 1 | Navigate directly to `https://university.engenious.io/profile` | The user is redirected to `/login?next=%2Fprofile`. Profile data is not shown. |
| 2 | Log in with `VALID_EMAIL` / `VALID_PASSWORD` | The login succeeds and the user is authenticated (the auth cookies are set). |
| 3 | Open the user menu (**open drawer**) | The drawer shows the user's name and a **Logout** button. |
| 4 | Click **Logout** | The session ends. The `eu_accessToken` cookie is removed and the **Sign in** link is available again. |
| 5 | Navigate to `https://university.engenious.io/profile` again (or press the browser **Back** button) | The user is redirected to `/login` again. A protected page cannot be reached after logout. |

---

## Out of scope (lower priority, P1/P2)

- Social login (Google / Facebook): third-party providers, which need dedicated test accounts.
- Forgot password flow.
- Brute-force lockout and rate limiting: these need a dedicated account so the shared test user isn't locked out.
- Cross-browser and mobile layouts.
