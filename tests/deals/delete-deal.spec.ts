import { test, expect } from '../../fixtures/base.fixture';
import { generateDealName } from '../../data/deals';

test.describe('Delete Deal', () => {
  // TC-16 — Delete a deal from the deal detail page (Actions menu)
  test('should delete a deal from the deal detail page via Actions menu', async ({
    page,
    dealsListPage,
    createDealModal,
    dealDetailPage,
  }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();

    const dealName = generateDealName('TC-16 Delete Via Actions');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    // Click Actions → Delete
    await dealDetailPage.openActions();
    await expect(dealDetailPage.deleteButton).toBeVisible();
    await dealDetailPage.deleteButton.click();

    // Confirm the deletion in the confirmation dialog
    const confirmDeleteButton = page.getByRole('dialog').getByRole('button', { name: 'Delete' });
    await expect(confirmDeleteButton).toBeVisible();
    await confirmDeleteButton.click();

    // User is redirected to the Deals list
    await page.waitForURL(/\/views\/all\/list/);

    // The deleted deal no longer appears in the Deals list
    await dealsListPage.searchDeal(dealName);
    await expect(page.getByRole('link', { name: dealName })).toBeHidden();
  });

  // TC-17 — Delete a deal from the list view (single row selection)
  test('should delete a deal from the list view via single row selection', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();

    const dealName = generateDealName('TC-17 Delete From List');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName);

    // Select the checkbox for the single test deal row
    const row = page.getByRole('row', { name: new RegExp(dealName) }).first();
    const checkbox = row.getByRole('checkbox');
    await checkbox.check();

    // Verify the bulk action toolbar appears with "1 deal selected"
    await expect(page.getByText('1 deal selected')).toBeVisible();

    // Click Delete in the bulk action toolbar
    await page.getByRole('button', { name: 'Delete' }).last().click();

    // Confirm the deletion
    const confirmButton = page.getByRole('dialog').getByRole('button', { name: 'Delete' });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // The deal is removed from the list
    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName);
    await expect(page.getByRole('link', { name: dealName })).toBeHidden();
  });

  // TC-18 — Delete multiple deals from the list view (bulk delete)
  test('should bulk delete 2 deals from the list view', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    await dealsListPage.open();

    // Create first deal
    await dealsListPage.openCreateDealModal();
    const dealName1 = generateDealName('TC-18 Bulk Delete 1');
    await createDealModal.create({ name: dealName1 });
    await page.waitForURL(/\/record\/0-3\//);

    // Create second deal
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();
    const dealName2 = generateDealName('TC-18 Bulk Delete 2');
    await createDealModal.create({ name: dealName2 });
    await page.waitForURL(/\/record\/0-3\//);

    await dealsListPage.open();
    await dealsListPage.searchDeal('TC-18 Bulk Delete');

    // Select checkboxes for both deals
    const rows = page.getByRole('row').filter({ has: page.getByRole('link', { name: /TC-18 Bulk Delete/ }) });
    const firstRow = rows.nth(0);
    const secondRow = rows.nth(1);

    await firstRow.getByRole('checkbox').check();
    await secondRow.getByRole('checkbox').check();

    // Verify bulk action toolbar shows "2 deals selected"
    await expect(page.getByText('2 deals selected')).toBeVisible();

    // Click Delete in the bulk action toolbar
    await page.getByRole('button', { name: 'Delete' }).last().click();

    // Confirm the deletion
    const confirmButton = page.getByRole('dialog').getByRole('button', { name: 'Delete' });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Both deals are removed from the list
    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName1);
    await expect(page.getByRole('link', { name: dealName1 })).toBeHidden();
    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName2);
    await expect(page.getByRole('link', { name: dealName2 })).toBeHidden();
  });

  // TC-19 — Cancel deal deletion (confirmation dialog dismiss)
  test('should cancel deletion and keep the deal intact', async ({
    page,
    dealsListPage,
    createDealModal,
    dealDetailPage,
  }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();

    const dealName = generateDealName('TC-19 Cancel Delete Deal');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    const currentUrl = page.url();

    // Click Actions → Delete
    await dealDetailPage.openActions();
    await dealDetailPage.deleteButton.click();

    // When the confirmation dialog appears, click Cancel
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

    // The dialog closes and deal still exists
    await expect(page).toHaveURL(currentUrl);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(dealName);
  });
});
