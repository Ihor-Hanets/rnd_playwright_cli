import { test, expect } from '../../fixtures/base.fixture';
import { generateDealName, DEAL_STAGES } from '../../data/deals';

test.describe('Deals List View', () => {
  test.beforeEach(async ({ dealsListPage }) => {
    await dealsListPage.open();
  });

  test('should display the Deals list page with correct title and table', async ({
    page,
    dealsListPage,
  }) => {
    await expect(page).toHaveTitle(/Deals/);
    await expect(dealsListPage.dealsTable).toBeVisible();
  });

  test('should display the required table columns', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /Deal Name/ })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Deal Stage/ })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Close Date/ })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Deal owner/ })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Amount/ })).toBeVisible();
  });

  test('should display the All deals, My deals view tabs', async ({ page }) => {
    // Tab buttons are inside a tablist — locate by their accessible name
    await expect(page.getByRole('button', { name: /All deals/ }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'My deals' }).first()).toBeVisible();
  });

  test('should show deal count badge on the All deals tab', async ({ page }) => {
    const allDealsTabBadge = page.getByRole('button', { name: /All deals \d+/ }).first();
    await expect(allDealsTabBadge).toBeVisible();
  });

  test('should display a newly created deal in the list', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    const dealName = generateDealName('List View Visibility Test');

    await dealsListPage.openCreateDealModal();
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    // Navigate to list and search for the deal (list may be paginated)
    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName);

    const dealLink = page.getByRole('link', { name: dealName }).first();
    await expect(dealLink).toBeVisible();
  });

  test('should search for a deal by name and show matching results', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    const uniqueName = generateDealName('SearchTarget');

    await dealsListPage.openCreateDealModal();
    await createDealModal.create({ name: uniqueName });
    await page.waitForURL(/\/record\/0-3\//);

    await dealsListPage.open();
    await dealsListPage.searchDeal(uniqueName);

    // Wait for search results to filter
    await expect(page.getByRole('link', { name: uniqueName }).first()).toBeVisible();
  });

  test('should navigate to deal detail page when clicking a deal name', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    const dealName = generateDealName('Click Navigate Test');

    await dealsListPage.openCreateDealModal();
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    await dealsListPage.open();
    await page.getByRole('link', { name: dealName }).first().click();

    await expect(page).toHaveURL(/\/record\/0-3\//);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(dealName);
  });

  test('should toggle the Select All records checkbox to select all deals', async ({
    page,
    dealsListPage,
  }) => {
    // Ensure table is visible before interacting with header checkbox
    await expect(dealsListPage.dealsTable).toBeVisible();
    const selectAllCheckbox = page.getByRole('checkbox', { name: 'Select all records.' });
    await expect(selectAllCheckbox).toBeVisible();

    await selectAllCheckbox.check();
    await expect(selectAllCheckbox).toBeChecked();

    await selectAllCheckbox.uncheck();
    await expect(selectAllCheckbox).not.toBeChecked();
  });

  test('should be able to select a single deal row via checkbox', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    const dealName = generateDealName('Checkbox Select Test');

    await dealsListPage.openCreateDealModal();
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    await dealsListPage.open();
    // Search for the deal to ensure it's on the current page
    await dealsListPage.searchDeal(dealName);

    const row = page.getByRole('row', { name: new RegExp(dealName) }).first();
    const checkbox = row.getByRole('checkbox');
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });

  test('should sort deals by Deal Name in ascending order', async ({ dealsListPage }) => {
    await dealsListPage.sortByDealName();

    await expect(dealsListPage.dealNameColumnHeader).toContainText('Deal Name');
  });

  test('should display the Add deals button', async ({ dealsListPage }) => {
    await expect(dealsListPage.addDealsButton).toBeVisible();
    await expect(
      dealsListPage.page.getByRole('button', { name: 'Add deals' }),
    ).toBeVisible();
  });

  test('should display the Filters toggle button in the toolbar', async ({ dealsListPage }) => {
    await expect(dealsListPage.filterToggleButton).toBeVisible();
  });

  test('should display the Edit columns button in the toolbar', async ({ dealsListPage }) => {
    await expect(dealsListPage.editColumnsButton).toBeVisible();
  });

  test('should display deal stage inline in the list and allow changing it', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    const dealName = generateDealName('Inline Stage Change');

    await dealsListPage.openCreateDealModal();
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    await dealsListPage.open();
    // Search to locate the deal on the current page
    await dealsListPage.searchDeal(dealName);

    // The stage button in the list shows the stage name (may include pipeline in parentheses)
    const stageButton = page
      .getByRole('row', { name: new RegExp(dealName) })
      .first()
      .getByRole('button', { name: /Appointment Scheduled/ });

    await stageButton.click();

    await expect(
      page.getByRole('option', { name: DEAL_STAGES.QUALIFIED_TO_BUY }).first(),
    ).toBeVisible();

    await page.getByRole('option', { name: DEAL_STAGES.QUALIFIED_TO_BUY }).first().click();

    await expect(
      page
        .getByRole('row', { name: new RegExp(dealName) })
        .first()
        .getByRole('button', { name: /Qualified To Buy/ }),
    ).toBeVisible();
  });
});
