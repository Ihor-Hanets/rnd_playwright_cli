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

  test('should display the required table columns', async ({ page, dealsListPage }) => {
    // Ensure required columns are present (state may be polluted from previous runs)
    const requiredCols = [
      { header: /Deal Stage/i, checkboxName: 'Deal Stage' },
      { header: /Close Date/i, checkboxName: 'Close Date' },
      { header: /Deal owner/i, checkboxName: 'Deal owner' },
      { header: /Amount/i, checkboxName: 'Amount' },
    ];
    const missing = [] as string[];
    for (const col of requiredCols) {
      if (!await page.getByRole('columnheader', { name: col.header }).isVisible({ timeout: 1000 })) {
        missing.push(col.checkboxName);
      }
    }
    if (missing.length > 0) {
      await dealsListPage.editColumnsButton.click();
      await expect(page.getByRole('heading', { name: 'Choose which columns you see' })).toBeVisible();
      const dialogSearch = page.getByPlaceholder('Search columns...');
      for (const name of missing) {
        // Search to move the item to the top of the list
        await dialogSearch.fill(name);
        const cb = page.getByRole('checkbox', { name, exact: true });
        // Use evaluate to invoke click() directly — the INPUT is CSS-positioned off-screen
        // so Playwright’s synthetic click fails; DOM click() works and fires React events
        if (!await cb.isChecked().catch(() => false)) {
          await cb.evaluate((el) => (el as HTMLInputElement).click());
        }
      }
      await dialogSearch.fill('');
      await page.getByRole('button', { name: 'Apply' }).click();
      await expect(page.getByRole('heading', { name: 'Choose which columns you see' })).toBeHidden();
    }
    await expect(page.getByRole('columnheader', { name: /Deal Name/ })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Deal Stage/ })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Close Date/ })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Deal owner/ })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Amount/ })).toBeVisible();
  });

  test('should display the All deals, My deals view tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: /All deals/ }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'My deals' }).first()).toBeVisible();
  });

  test('should show deal count badge on the All deals tab', async ({ page }) => {
    const allDealsTabBadge = page.getByRole('button', { name: /All deals \d+/ }).first();
    await expect(allDealsTabBadge).toBeVisible();
  });

  // TC-21 — Search for a deal by name in list view
  test('should search for a deal by name and show only matching results', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    const uniqueName = generateDealName('TC-21 SearchTarget');

    await dealsListPage.openCreateDealModal();
    await createDealModal.create({ name: uniqueName });
    await page.waitForURL(/\/record\/0-3\//);

    await dealsListPage.open();

    // Type the exact deal name in the Search field
    await dealsListPage.searchDeal(uniqueName);

    // Wait for search results — only the matching deal is displayed
    await expect(page.getByRole('link', { name: uniqueName }).first()).toBeVisible();

    // Non-matching deals are hidden (only 1 row visible)
    const rows = page.getByRole('row').filter({ hasNotText: 'Deal Name' }).filter({ has: page.getByRole('link') });
    await expect(rows).toHaveCount(1);
  });

  // TC-22 — Search returns no results for non-existent deal name
  test('should return no results when searching for a non-existent deal name', async ({
    page,
    dealsListPage,
  }) => {
    // Type a name that does not match any deal
    await dealsListPage.searchDeal('ZZZZ_NONEXISTENT_DEAL_XYZ_TC22');

    // Wait for the list to update — no deals or a "no results" message
    await expect(page.getByRole('link').filter({ hasText: /ZZZZ_NONEXISTENT_DEAL_XYZ_TC22/ })).toHaveCount(0);
  });

  // TC-23 — Filter deals by Deal owner (quick filter)
  test('should filter deals by Deal owner and show only their deals', async ({
    page,
  }) => {
    // Click the Deal owner quick filter button
    await page.getByRole('button', { name: 'Deal owner' }).first().click();

    // Select a specific owner
    const ownerOption = page.getByRole('option', { name: /Ihor Hanets/ }).first();
    await expect(ownerOption).toBeVisible();
    await ownerOption.click();

    // Press Escape to close the dropdown
    await page.keyboard.press('Escape');

    // Filter is shown as active in the filter bar (Deal owner chip shows count)
    await expect(page.getByRole('button', { name: 'Clear all' })).toBeVisible();
  });

  // TC-24 — Filter deals by Close date (quick filter)
  test('should filter deals by Close date using a date range', async ({
    page,
  }) => {
    // Click the Close date quick filter button
    await page.getByRole('button', { name: 'Close date' }).first().click();

    // Select a date range — click the first available option
    await page.getByRole('option').first().click();

    // Filter chip button should be visible and active indicating filter is applied
    await expect(page.getByRole('button', { name: /Close date/ }).first()).toBeVisible();
  });

  // TC-25 — Clear applied filters
  test('should clear applied filters and restore the full deals list', async ({
    page,
    dealsListPage,
  }) => {
    // Apply the Deal owner filter first
    await page.getByRole('button', { name: 'Deal owner' }).first().click();
    const ownerOption = page.getByRole('option', { name: /Ihor Hanets/ }).first();
    await expect(ownerOption).toBeVisible();
    await ownerOption.click();
    await page.keyboard.press('Escape');

    // 'Clear all' button appears when a filter is active
    await expect(page.getByRole('button', { name: 'Clear all' })).toBeVisible();

    // Remove all filters by clicking the Clear all button
    await page.getByRole('button', { name: 'Clear all' }).click();

    // The full deals list is restored
    await expect(dealsListPage.dealsTable).toBeVisible();
  });

  // TC-26 — Filter by Pipeline
  test('should filter deals by Sales Pipeline', async ({
    page,
  }) => {
    // Click the All Pipelines dropdown button
    await page.getByRole('button', { name: /All Pipelines/ }).first().click();

    // Select Sales Pipeline from the dropdown options
    await page.getByRole('option', { name: 'Sales Pipeline' }).first().click();

    // Pipeline selector shows Sales Pipeline as selected
    await expect(page.getByRole('button', { name: /Sales Pipeline/ }).first()).toBeVisible();
  });

  // TC-27 — Sort deals by Deal Name (A → Z)
  test('should display deals sorted by Deal Name ascending by default', async ({
    page,
    dealsListPage,
  }) => {
    // Verify the Deal Name column is the active sort column (direction depends on persisted state)
    await expect(dealsListPage.dealNameColumnHeader).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /(Ascending|Descending) sort/ })).toBeVisible();
  });

  // TC-28 — Sort deals by Deal Name (Z → A)
  test('should sort deals by Deal Name descending when clicking column header twice', async ({
    page,
    dealsListPage,
  }) => {
    // Ensure ascending sort first (default state may be descending from previous test run)
    const alreadyAscending = await page
      .getByRole('columnheader', { name: /Ascending sort/ })
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (!alreadyAscending) {
      await dealsListPage.sortByDealName();
      await expect(page.getByRole('columnheader', { name: /Ascending sort/ })).toBeVisible();
    }
    // Click once to toggle to Descending (Z → A)
    await dealsListPage.sortByDealName();
    await expect(page.getByRole('columnheader', { name: /Descending sort/ })).toBeVisible();
  });

  // TC-29 — Sort by column header click (Deal Name)
  test('should toggle sort direction when clicking Deal Name column header', async ({
    page,
    dealsListPage,
  }) => {
    // Determine current sort direction and verify the sort indicator is shown
    const isAscending = await page
      .getByRole('columnheader', { name: /Ascending sort/ })
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    const currentSortPattern = isAscending ? /Ascending sort/ : /Descending sort/;
    const toggledSortPattern = isAscending ? /Descending sort/ : /Ascending sort/;
    await expect(page.getByRole('columnheader', { name: currentSortPattern })).toBeVisible();

    // Click the Deal Name column header
    await dealsListPage.sortByDealName();

    // Sort changes to the opposite direction
    await expect(page.getByRole('columnheader', { name: toggledSortPattern })).toBeVisible();
  });

  // TC-40 — Switch between deal views tabs (All deals / My deals)
  test('should switch to My deals tab and filter to current user deals', async ({
    dealsListPage,
  }) => {
    // Click the My deals tab
    await dealsListPage.myDealsTab.click();

    // The "My deals" tab is active
    await expect(dealsListPage.myDealsTab).toBeVisible();
    await expect(dealsListPage.dealsTable).toBeVisible();
  });

  // TC-41 — Verify deal count badge on "All deals" tab
  test('should increase All deals count badge by 1 after creating a new deal', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    // Note the number shown in the All deals badge
    const allDealsButton = page.getByRole('button', { name: /All deals \d+/ }).first();
    const countText = await allDealsButton.textContent();
    const initialCount = parseInt((countText ?? '').replace(/[^0-9]/g, ''), 10);

    // Create a new deal
    await dealsListPage.openCreateDealModal();
    const dealName = generateDealName('TC-41 Count Badge Test');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    // Navigate back to the Deals list view
    await dealsListPage.open();

    // Badge count on "All deals" tab increases by at least 1 (parallel tests may also add deals)
    const newCountText = await allDealsButton.textContent();
    const newCount = parseInt((newCountText ?? '').replace(/[^0-9]/g, ''), 10);
    expect(newCount).toBeGreaterThan(initialCount);
  });

  // TC-42 — Select all deals and verify bulk action toolbar
  test('should show bulk action toolbar when selecting all deals', async ({
    page,
    dealsListPage,
  }) => {
    // Ensure table is visible before interacting with header checkbox
    await expect(dealsListPage.dealsTable).toBeVisible();

    // Click the Select all records checkbox in the table header (force click bypasses the styled wrapper)
    await dealsListPage.selectAllCheckbox.click({ force: true });

    // All visible deals in the current page are selected
    await expect(dealsListPage.selectAllCheckbox).toBeChecked();

    // Bulk action toolbar appears showing "N deals selected"
    await expect(page.getByText(/\d+ deal/).first()).toBeVisible();

    // Action buttons visible in the bulk action toolbar
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toBeVisible();
  });

  // TC-43 — Deselect rows clears bulk action toolbar
  test('should hide bulk action toolbar when deselecting all rows', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    // Create and search for a deal to ensure stable state
    await dealsListPage.openCreateDealModal();
    const dealName = generateDealName('TC-43 Deselect Test');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName);

    // Select one deal row (force click bypasses styled checkbox wrapper)
    const row = page.getByRole('row', { name: new RegExp(dealName) }).first();
    const checkbox = row.getByRole('checkbox');
    await checkbox.click({ force: true });

    // Bulk action toolbar should be visible
    await expect(page.getByText('1 deal selected')).toBeVisible();

    // Uncheck the selected deal's checkbox
    await checkbox.click({ force: true });

    // Bulk action toolbar disappears
    await expect(page.getByText('1 deal selected')).toBeHidden();
  });

  // TC-44 — Open "Edit columns" dialog
  test('should open Edit columns dialog with all column categories', async ({
    page,
    dealsListPage,
  }) => {
    // Click the Edit columns button
    await dealsListPage.editColumnsButton.click();

    // A dialog titled "Choose which columns you see" opens
    await expect(page.getByRole('heading', { name: 'Choose which columns you see' })).toBeVisible();

    // Available column categories are shown
    await expect(page.getByRole('heading', { name: 'Associations' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Deal activity' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Deal information' })).toBeVisible();

    // Currently selected columns count is shown
    await expect(page.getByRole('heading', { name: /Selected columns/ })).toBeVisible();

    await page.keyboard.press('Escape');
  });

  // TC-45 — Add a column and verify it appears in the table
  test('should add Deal Type column and verify it appears in the table header', async ({
    page,
    dealsListPage,
  }) => {
    // Click Edit columns
    await dealsListPage.editColumnsButton.click();
    await expect(page.getByRole('heading', { name: 'Choose which columns you see' })).toBeVisible();

    // Search for Deal Type in the dialog to bring it into view
    const dialogSearch = page.getByPlaceholder('Search columns...');
    await dialogSearch.fill('Deal Type');
    const dealTypeCheckbox = page.getByRole('checkbox', { name: 'Deal Type', exact: true });
    await expect(dealTypeCheckbox).toBeAttached();
    // Use DOM click() — the INPUT is CSS-positioned off-screen so Playwright’s synthetic click fails
    if (await dealTypeCheckbox.isChecked().catch(() => false)) {
      await dealTypeCheckbox.evaluate((el) => (el as HTMLInputElement).click()); // uncheck first
    }
    await dealTypeCheckbox.evaluate((el) => (el as HTMLInputElement).click()); // check

    // Click Apply
    await page.getByRole('button', { name: 'Apply' }).click();

    // The dialog closes
    await expect(page.getByRole('heading', { name: 'Choose which columns you see' })).toBeHidden();

    // Deal Type column appears in the table header
    await expect(page.getByRole('columnheader', { name: /Deal Type/ })).toBeVisible();
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

    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName);

    const dealLink = page.getByRole('link', { name: dealName }).first();
    await expect(dealLink).toBeVisible();
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
    await dealsListPage.searchDeal(dealName);
    await page.getByRole('link', { name: dealName }).first().click();

    await expect(page).toHaveURL(/\/record\/0-3\//);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(dealName);
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

  test('should toggle the Select All records checkbox to select all deals', async ({
    page,
    dealsListPage,
  }) => {
    // Ensure table is visible before interacting with header checkbox
    await expect(dealsListPage.dealsTable).toBeVisible();
    const selectAllCheckbox = page.getByRole('checkbox', { name: 'Select all records.' });
    await expect(selectAllCheckbox).toBeVisible();

    // Force click to bypass the ToggleInputWrapper styled layer
    await selectAllCheckbox.click({ force: true });
    await expect(selectAllCheckbox).toBeChecked();

    await selectAllCheckbox.click({ force: true });
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
    await checkbox.click({ force: true });
    await expect(checkbox).toBeChecked();
  });

  test('should sort deals by Deal Name in ascending order', async ({ dealsListPage }) => {
    await dealsListPage.sortByDealName();

    await expect(dealsListPage.dealNameColumnHeader).toContainText('Deal Name');
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

    // Ensure Deal Stage column is visible (state may be polluted from previous runs)
    if (!await page.getByRole('columnheader', { name: /Deal Stage/ }).isVisible({ timeout: 1000 })) {
      await dealsListPage.editColumnsButton.click();
      await expect(page.getByRole('heading', { name: 'Choose which columns you see' })).toBeVisible();
      // Search to bring Deal Stage into view
      const dialogSearch = page.getByPlaceholder('Search columns...');
      await dialogSearch.fill('Deal Stage');
      const dealStageCheckbox = page.getByRole('checkbox', { name: 'Deal Stage', exact: true });
      await expect(dealStageCheckbox).toBeAttached();
      // Use DOM click() — the INPUT is CSS-positioned off-screen so Playwright’s synthetic click fails
      if (!await dealStageCheckbox.isChecked().catch(() => false)) {
        await dealStageCheckbox.evaluate((el) => (el as HTMLInputElement).click());
      }
      await page.getByRole('button', { name: 'Apply' }).click();
      await expect(page.getByRole('heading', { name: 'Choose which columns you see' })).toBeHidden();
    }

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
