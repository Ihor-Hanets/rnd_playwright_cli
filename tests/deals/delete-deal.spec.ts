import { test, expect } from '../../fixtures/base.fixture';
import { generateDealName } from '../../data/deals';

test.describe('Delete Deal', () => {
  test('should delete a deal from the deal detail page via Actions menu', async ({
    page,
    dealsListPage,
    createDealModal,
    dealDetailPage,
  }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();

    const dealName = generateDealName('Delete Via Actions');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    await dealDetailPage.openActions();
    await expect(dealDetailPage.deleteButton).toBeVisible();
    await dealDetailPage.deleteButton.click();

    const confirmDeleteButton = page
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete' });
    await expect(confirmDeleteButton).toBeVisible();
    await confirmDeleteButton.click();

    await page.waitForURL(/\/views\/all\/list/);
    await expect(page.getByRole('link', { name: dealName })).toBeHidden();
  });

  test('should show a confirmation dialog before deleting a deal', async ({
    page,
    dealsListPage,
    createDealModal,
    dealDetailPage,
  }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();

    const dealName = generateDealName('Delete Confirm Dialog');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    await dealDetailPage.openActions();
    await dealDetailPage.deleteButton.click();

    await expect(page.getByRole('dialog').getByRole('button', { name: 'Delete' })).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('should cancel deletion and keep the deal intact', async ({
    page,
    dealsListPage,
    createDealModal,
    dealDetailPage,
  }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();

    const dealName = generateDealName('Cancel Delete Deal');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    const currentUrl = page.url();

    await dealDetailPage.openActions();
    await dealDetailPage.deleteButton.click();

    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(currentUrl);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(dealName);
  });

  test('should show Clone and Merge options alongside Delete in Actions menu', async ({
    page,
    dealsListPage,
    createDealModal,
    dealDetailPage,
  }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();

    const dealName = generateDealName('Actions Menu Check');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    await dealDetailPage.openActions();

    await expect(dealDetailPage.deleteButton).toBeVisible();
    await expect(dealDetailPage.cloneButton).toBeVisible();
    await expect(dealDetailPage.mergeButton).toBeVisible();
  });
});
