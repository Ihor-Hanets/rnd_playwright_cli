# Automation Template — TypeScript + Playwright

A production-ready test automation template using **Playwright**, **TypeScript**, **dotenv**, **ESLint** and **Prettier**.

---

## Project Structure

```
automation_template_ts/
├── .env                    # Local env vars (not committed)
├── .env.example            # Template for env vars
├── playwright.config.ts    # Playwright configuration
├── tsconfig.json           # TypeScript configuration
├── .eslintrc.json          # ESLint rules
├── .prettierrc             # Prettier formatting
│
├── tests/                  # Test specs
│   └── example/
│       └── example.spec.ts
│
├── pages/                  # Page Object Models
│   ├── base.page.ts        # Abstract base page
│   └── example.page.ts
│
├── fixtures/               # Custom Playwright fixtures
│   └── base.fixture.ts
│
├── utils/                  # Helpers & config
│   ├── env.ts              # Typed env config
│   └── helpers.ts          # API, random, date utils
│
└── data/                   # Test data
    └── users.ts
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
npx playwright install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your target URLs and credentials
```

---

## Scripts

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `npm test`             | Run all tests (headless)         |
| `npm run test:headed`  | Run tests with browser visible   |
| `npm run test:ui`      | Open Playwright UI mode          |
| `npm run test:debug`   | Run tests in debug mode          |
| `npm run test:report`  | Open last HTML report            |
| `npm run lint`         | Check for lint errors            |
| `npm run lint:fix`     | Auto-fix lint errors             |
| `npm run format`       | Format all files with Prettier   |
| `npm run format:check` | Check formatting without writing |
| `npm run type-check`   | TypeScript type check (no emit)  |

---

## Adding a New Page Object

1. Create `pages/my-feature.page.ts` extending `BasePage`
2. Add it to `fixtures/base.fixture.ts`
3. Use it in your spec via the fixture

---

## Environment Variables

| Variable          | Default                   | Description          |
| ----------------- | ------------------------- | -------------------- |
| `BASE_URL`        | `https://example.com`     | App base URL         |
| `API_URL`         | `https://api.example.com` | API base URL         |
| `USERNAME`        | —                         | Test user login      |
| `PASSWORD`        | —                         | Test user password   |
| `DEFAULT_TIMEOUT` | `30000`                   | Action timeout in ms |
