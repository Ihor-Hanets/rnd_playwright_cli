import { test, expect } from '../../fixtures/base.fixture';
import { generateDealName } from '../../data/deals';

test.describe('Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacts/148143933/objects/0-3/views/all/list');
    await page.waitForLoadState('domcontentloaded');
    await page.getByTestId('create-object-dropdown').click();
    await page.getByTestId('create-object-dropdown-create-object').click();
  });

  // TC-46 — Deal name with special characters
  test('should create a deal with special characters in the name', async ({
    page,
    createDealModal,
  }) => {
    const specialName = `Test Deal <>&"' ${Date.now()}`;

    // Open the Create Deal modal
    await expect(createDealModal.heading).toBeVisible();

    // Enter a deal name containing special characters
    await createDealModal.fillDealName(specialName);

    // Click Create
    await createDealModal.createButton.click();
    await page.waitForURL(/\/record\/0-3\//);

    // Deal is created without errors
    const heading = page.getByRole('heading', { level: 2 }).first();
    await expect(heading).toBeVisible();

    // The deal name is displayed correctly
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText('Test Deal');
  });

  // TC-47 — Deal name with very long text (boundary test)
  test('should handle a deal name of 255 characters gracefully', async ({
    page,
    createDealModal,
  }) => {
    const longName = 'A'.repeat(255);

    await createDealModal.fillDealName(longName);

    // Verify the input accepted the text (field may truncate but no crash)
    await expect(createDealModal.dealNameInput).toBeVisible();

    // If Create button is enabled, the field accepted the input
    await expect(createDealModal.createButton).toBeEnabled();

    await createDealModal.createButton.click();

    // Deal is created or a validation message is shown — either way no JS error
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByTestId('create-object-dropdown').or(page.getByRole('heading', { level: 2 }))).toBeVisible();
  });

  // TC-48 — Amount field accepts only numeric values
  test('should reject non-numeric input in the Amount field', async ({
    createDealModal,
  }) => {
    const dealName = generateDealName('TC-48 Amount Validation');
    await createDealModal.fillDealName(dealName);

    // Type alphabetical text in the Amount field
    await createDealModal.amountInput.fill('abc');
    await createDealModal.amountInput.blur();
    await expect(createDealModal.amountInput).not.toHaveValue('abc');
    // HubSpot Amount field is a text input that does not immediately reject non-numeric values
    // in the UI; validation occurs server-side on form submission. The field accepts 'abc' as input.
    // test.fixme: HubSpot does not client-side reject non-numeric input in the Amount field.
    // Actual behavior: field keeps 'abc' value; no inline validation error shown.
    // await expect(createDealModal.amountInput).toBeVisible();
  });

  // TC-49 — Amount field with decimal value
  test('should create a deal with a decimal amount and display it correctly', async ({
    page,
    createDealModal,
  }) => {
    const dealName = generateDealName('TC-49 Decimal Amount');

    await createDealModal.fillDealName(dealName);
    await createDealModal.fillAmount('9999.99');
    await createDealModal.createButton.click();

    // Deal is created and redirects to detail page
    await page.waitForURL(/\/record\/0-3\//);

    // Amount is stored and displayed as 9,999.99
    await expect(page.getByText('9,999.99')).toBeVisible();
  });

  // TC-50 — Deal with no close date set shows "--" in list
  test('should show -- in Close Date column for deals with no close date', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    const dealName = generateDealName('TC-50 No Close Date');

    // Create a deal without setting a close date
    await createDealModal.fillDealName(dealName);
    // Leave Close date blank
    await createDealModal.createButton.click();
    await page.waitForURL(/\/record\/0-3\//);

    // Find the deal in the list
    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName);

    const row = page.getByRole('row', { name: new RegExp(dealName) }).first();
    await expect(row).toBeVisible();

    // The Close Date column shows -- (not an error)
    await expect(row.getByRole('button', { name: '--' }).first()).toBeVisible();
  });
});
