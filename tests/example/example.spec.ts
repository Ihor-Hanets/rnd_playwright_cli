import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env';

test.describe('Example tests', () => {
  test.beforeEach(async ({ examplePage }) => {
    await examplePage.open();
  });

  test('should load the home page and have a title', async ({ examplePage }) => {
    const title = await examplePage.getTitle();
    expect(title).toBeTruthy();
  });

  test('should navigate to base URL from env', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(ENV.baseUrl));
  });
});
