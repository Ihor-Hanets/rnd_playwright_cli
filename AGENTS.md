# AI Agent Instructions — TypeScript Playwright Automation

You are working in a **test automation** project built with TypeScript and Playwright.
Follow these rules strictly when generating or modifying code.

---

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Test framework**: Playwright Test (`@playwright/test`)
- **Env management**: dotenv (`.env` file, loaded in `playwright.config.ts`)
- **Linting**: ESLint with `@typescript-eslint` + `eslint-plugin-playwright`
- **Formatting**: Prettier

---

## Project Structure

```
├── tests/            # Test specs — grouped by feature in subdirectories
├── pages/            # Page Object Models (POM)
├── fixtures/         # Custom Playwright fixtures
├── utils/            # Helpers, API clients, env config
├── data/             # Test data (users, constants, etc.)
```

### Key Files

| File | Purpose |
|---|---|
| `playwright.config.ts` | Playwright configuration (browsers, timeouts, reporters) |
| `fixtures/base.fixture.ts` | Custom test fixtures — every new page object must be registered here |
| `pages/base.page.ts` | Abstract base class for all page objects |
| `utils/env.ts` | Typed access to environment variables |
| `utils/helpers.ts` | Shared utility functions |

---

## Conventions

### Page Objects

- Every page object **must extend** `BasePage` from `pages/base.page.ts`.
- File naming: `<feature>.page.ts` (e.g. `login.page.ts`, `dashboard.page.ts`).
- Use Playwright's built-in locator strategies: `getByRole()`, `getByTestId()`, `getByText()`, `getByLabel()`. Prefer these over raw CSS/XPath selectors.
- Keep locators as class properties or methods — never hardcode selectors inside tests.
- Every page object must have an `open()` method that navigates to the page.

```typescript
// ✅ Correct
export class LoginPage extends BasePage {
  readonly usernameInput = this.page.getByLabel('Username');
  readonly passwordInput = this.page.getByLabel('Password');
  readonly submitButton = this.page.getByRole('button', { name: 'Sign in' });

  async open(): Promise<void> {
    await this.navigate('/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### Fixtures

- After creating a new page object, **always register it** in `fixtures/base.fixture.ts`.
- The fixture provides pre-instantiated page objects to tests — tests should never call `new PageObject()` directly.

```typescript
// fixtures/base.fixture.ts
export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});
```

### Tests

- File naming: `<feature>.spec.ts` inside `tests/<feature>/` directory.
- Import `test` and `expect` from `fixtures/base.fixture.ts`, **not** from `@playwright/test` directly.
- Use `test.describe()` to group related tests.
- Use `test.beforeEach()` for shared setup (e.g. navigation).
- Test names should be descriptive: `'should display error for invalid credentials'`.
- Never use `page.waitForTimeout()` — use proper Playwright waiting mechanisms.
- Prefer web-first assertions (`expect(locator).toBeVisible()`) over manual checks.

```typescript
// ✅ Correct
import { test, expect } from '../../fixtures/base.fixture';

test.describe('Login', () => {
  test('should display error for invalid credentials', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('wrong', 'wrong');
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
```

### Test Data

- Keep test data in `data/` directory — never hardcode values in tests.
- Use TypeScript interfaces for data shapes.
- Sensitive data (credentials) should come from `.env` via `utils/env.ts`.

### Environment Variables

- Access env vars through the typed `ENV` object from `utils/env.ts`, not `process.env` directly in tests/pages.
- Add new variables to both `.env` and `.env.example`.
- Update the `ENV` object in `utils/env.ts` when adding new variables.

---

## Code Style Rules

- **Always** add explicit return types to functions and methods.
- Use `async/await` — never raw Promises.
- Prefer `const` over `let`; never use `var`.
- Use single quotes for strings.
- Use trailing commas.
- Prefix unused parameters with `_`.
- No `console.log` — use `console.info`, `console.warn`, or `console.error` if needed.
- No `any` type — use `unknown` if the type is truly unknown, or define a proper interface.

---

## Commands

| Command | When to use |
|---|---|
| `npm test` | Run all tests |
| `npm run test:headed` | Debug visually |
| `npm run lint` | Check for lint errors before committing |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format all files |
| `npm run type-check` | Verify TypeScript compiles |

---

## Workflow for Adding a New Feature Test

1. **Create page object**: `pages/<feature>.page.ts` extending `BasePage`
2. **Register fixture**: Add the page to `fixtures/base.fixture.ts`
3. **Add test data**: If needed, create/update files in `data/`
4. **Write tests**: `tests/<feature>/<feature>.spec.ts`
5. **Verify**: Run `npm run type-check && npm run lint && npm test`

---

## Anti-Patterns to Avoid

- ❌ Do NOT import `test` or `expect` from `@playwright/test` in spec files — use `fixtures/base.fixture.ts`
- ❌ Do NOT use `networkidle` wait state — use `domcontentloaded` or `load`
- ❌ Do NOT use `page.waitForTimeout()` — use `expect(locator).toBeVisible()` or similar
- ❌ Do NOT put selectors in test files — encapsulate them in page objects
- ❌ Do NOT use `process.env` in tests/pages — use `ENV` from `utils/env.ts`
- ❌ Do NOT create page instances in test files — use fixtures
