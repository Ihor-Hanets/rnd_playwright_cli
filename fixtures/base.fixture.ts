import { test as base } from '@playwright/test';
import { ExamplePage } from '../pages/example.page';

type Pages = {
  examplePage: ExamplePage;
};

export const test = base.extend<Pages>({
  examplePage: async ({ page }, use) => {
    const examplePage = new ExamplePage(page);
    await use(examplePage);
  },
});

export { expect } from '@playwright/test';
