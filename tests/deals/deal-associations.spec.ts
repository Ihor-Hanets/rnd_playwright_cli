import { test, expect } from '../../fixtures/base.fixture';
import { generateDealName } from '../../data/deals';

test.describe('Deal Detail Page — Associations', () => {
  let dealUrl: string;

  test.beforeEach(async ({ page, dealsListPage, createDealModal  }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();

    const dealName = generateDealName('Association Test Setup');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);
    dealUrl = page.url();
  });

  // TC-38 — Add a contact association from the deal detail page
  test('should add a contact association from the deal detail page', async ({
    page,
  }) => {
    await page.goto(dealUrl);

    // Scroll to the Contacts (0) section in the right sidebar
    await expect(page.getByRole('button', { name: /Contacts \(0\)/ })).toBeVisible();

    // Click Add next to Contacts
    const addContactBtn = page.getByRole('button', { name: /Contacts \(0\)/ })
      .locator('..')
      .locator('..')
      .getByRole('button', { name: 'Add' })
      .first();
    await addContactBtn.click();

    // Association iframe opens with "Add existing Contact" heading
    const assocIframe = page.frameLocator('iframe[src*="association"], iframe').last();
    await expect(assocIframe.getByRole('heading', { name: /Add existing Contact/ })).toBeVisible();

    // Select the first contact from the list
    const firstContactCheckbox = assocIframe.getByRole('checkbox').first();
    await firstContactCheckbox.check();

    // Save
    await assocIframe.getByRole('button', { name: 'Save' }).click();

    // Contacts section shows Contacts (1)
    await expect(page.getByRole('button', { name: /Contacts \(1\)/ })).toBeVisible();
  });

  // TC-39 — Add a company association from the deal detail page
  test('should add a company association from the deal detail page', async ({
    page,
  }) => {
    await page.goto(dealUrl);

    // Scroll to the Companies (0) section in the right sidebar
    await expect(page.getByRole('button', { name: /Companies \(0\)/ })).toBeVisible();

    // Click Add next to Companies
    const addCompanyBtn = page.getByRole('button', { name: /Companies \(0\)/ })
      .locator('..')
      .locator('..')
      .getByRole('button', { name: 'Add' })
      .first();
    await addCompanyBtn.click();

    // Association iframe opens with "Add existing Company" heading
    const assocIframe = page.frameLocator('iframe[src*="association"], iframe').last();
    await expect(assocIframe.getByRole('heading', { name: /Add existing Company/ })).toBeVisible();

    // Search for a company
    await assocIframe.getByRole('searchbox').fill('my');

    // Select the first result
    const firstCheckbox = assocIframe.getByRole('checkbox').first();
    await expect(firstCheckbox).toBeVisible();
    await firstCheckbox.check();

    // Save
    await assocIframe.getByRole('button', { name: 'Save' }).click();

    // Companies section shows Companies (1)
    await expect(page.getByRole('button', { name: /Companies \(1\)/ })).toBeVisible();
  });
});
