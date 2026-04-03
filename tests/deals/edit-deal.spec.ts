import { test, expect } from '../../fixtures/base.fixture';
import { generateDealName, DEAL_STAGES } from '../../data/deals';

test.describe('Edit Deal', () => {
  let dealUrl: string;

  test.beforeEach(async ({ page, dealsListPage, createDealModal }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();

    const dealName = generateDealName('Edit Test Setup');
    await createDealModal.create({ name: dealName });

    await page.waitForURL(/\/record\/0-3\//);
    dealUrl = page.url();
  });

  // TC-09 — Edit deal name via the Edit button on detail page
  test('should edit deal name via Edit button and persist after reload', async ({
    page,
    dealDetailPage,
  }) => {
    test.setTimeout(120_000);
    await page.goto(dealUrl);
    await page.waitForLoadState('domcontentloaded');
    // Wait for the deal detail page to be fully loaded by confirming heading is visible
    await expect(page.locator('[data-test-id="highlight-record-label"]')).toBeVisible();

    const newName = generateDealName('TC-09 Renamed Deal');

    // Click Edit button next to the deal name
    await dealDetailPage.editNameButton.click();
    const nameInput = page.getByRole('textbox', { name: 'Deal Name' });
    await expect(nameInput).toBeVisible();
    await nameInput.fill(newName);
    await nameInput.press('Tab');
    // Click on the deal title heading to close the edit panel and trigger save
    await page.locator('[data-test-id="highlight-record-label"]').click();
    // Wait for the edit panel to close (textbox disappears) before proceeding
    await expect(page.getByRole('textbox', { name: 'Deal Name' })).toBeHidden();

    // Deal detail page heading reflects the new name
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(newName);

    // Verify rename persists after page reload (confirming server-side save)
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(newName);
  });

  // TC-10 — Change deal stage from the detail page
  test('should change deal stage to Qualified To Buy from the detail page', async ({
    page,
    dealDetailPage,
  }) => {
    await page.goto(dealUrl);

    // Locate the Deal Stage button showing Appointment Scheduled
    await expect(page.getByRole('button', { name: /Appointment Scheduled/ })).toBeVisible();

    // Click to open the stage dropdown and select Qualified To Buy
    await dealDetailPage.changeDealStage(DEAL_STAGES.QUALIFIED_TO_BUY);

    // Deal Stage button updates to Qualified To Buy
    await expect(
      page.getByRole('button', { name: DEAL_STAGES.QUALIFIED_TO_BUY }),
    ).toBeVisible();
  });

  // TC-11 — Change deal stage to Closed Won
  test('should change deal stage to Closed Won', async ({
    page,
    dealDetailPage,
  }) => {
    await page.goto(dealUrl);

    await dealDetailPage.changeDealStage(DEAL_STAGES.CLOSED_WON);

    await expect(
      page.getByRole('button', { name: DEAL_STAGES.CLOSED_WON }),
    ).toBeVisible();
  });

  // TC-12 — Change deal stage to Closed Lost
  test('should change deal stage to Closed Lost', async ({
    page,
    dealDetailPage,
  }) => {
    await page.goto(dealUrl);

    await dealDetailPage.changeDealStage(DEAL_STAGES.CLOSED_LOST);

    await expect(
      page.getByRole('button', { name: DEAL_STAGES.CLOSED_LOST }),
    ).toBeVisible();
  });

  // TC-13 — Edit deal amount inline (from list view)
  test('should edit deal amount inline from the list view', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    // Create a deal to edit
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();
    const dealName = generateDealName('TC-13 Amount Edit');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName);

    // Click the Amount cell (shows --)
    const row = page.getByRole('row', { name: new RegExp(dealName) }).first();
    const amountCell = row.getByRole('button', { name: '--' }).first();
    await amountCell.click();

    // Enter value 5000 and confirm
    const amountInput = row.getByRole('textbox').first();
    await amountInput.fill('5000');
    await amountInput.press('Enter');

    // Amount cell in the list updates
    await expect(row.getByText('5,000')).toBeVisible();

    // On deal detail page, Amount reflects 5,000
    await dealsListPage.clickDeal(dealName);
    await page.waitForURL(/\/record\/0-3\//);
    await expect(page.getByText('5,000')).toBeVisible();
  });

  // TC-14 — Edit deal close date inline (from list view)
  test('should edit deal close date inline from the list view', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();
    const dealName = generateDealName('TC-14 Close Date Edit');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName);

    // Click the Close Date cell (matches date text like "Apr 30, 2026" but not stage names)
    const row = page.getByRole('row', { name: new RegExp(dealName) }).first();
    const closeDateCell = row.getByRole('button').filter({ hasText: /\d{1,2},\s*\d{4}|\d{1,2}\/\d{1,2}\/\d{4}/ }).first();
    await closeDateCell.click();

    // Enter a future date and confirm
    const dateInput = page.getByPlaceholder('MM/DD/YYYY').first();
    // Type character by character so the calendar stays open and navigates to December
    await dateInput.pressSequentially('12/31/2026');
    // Calendar now shows December 2026 with 31 as a highlighted menuitem — click it to set the date
    await page.getByRole('menuitem', { name: '31' }).click();
    // Click search input to move focus out of the date editor, which triggers the server-side save
    await dealsListPage.searchInput.click();
    // Wait for the autosave indicator toast to confirm the API request completed
    await expect(page.getByTestId('autosave-indicator')).toBeVisible();
    // Navigate away and back to display the formatted date (editor closes on reload)
    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName);

    // Close Date cell now shows the formatted value (HubSpot renders as "Dec 31, 2026 ..." with time/timezone)
    const updatedRow = page.getByRole('row', { name: new RegExp(dealName) }).first();
    await expect(updatedRow.getByText(/Dec 31, 2026/)).toBeVisible();
  });

  // TC-15 — Edit deal stage inline (from list view)
  test('should edit deal stage inline from the list view', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();
    const dealName = generateDealName('TC-15 Stage Inline Edit');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName);

    // Click the Deal Stage cell for the test deal
    const row = page.getByRole('row', { name: new RegExp(dealName) }).first();
    const stageButton = row.getByRole('button', { name: new RegExp(DEAL_STAGES.APPOINTMENT_SCHEDULED) });
    await stageButton.click();

    // Select a different stage from the dropdown
    const stageOption = page.getByRole('option', { name: DEAL_STAGES.PRESENTATION_SCHEDULED }).first();
    await expect(stageOption).toBeVisible();
    await stageOption.click();

    // Deal Stage cell updates immediately
    await expect(row.getByRole('button', { name: new RegExp(DEAL_STAGES.PRESENTATION_SCHEDULED) })).toBeVisible();
  });
});
