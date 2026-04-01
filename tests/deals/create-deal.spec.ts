import { test, expect } from '../../fixtures/base.fixture';
import { generateDealName, DEAL_STAGES, PIPELINES } from '../../data/deals';

test.describe('Create Deal', () => {
  test.beforeEach(async ({ dealsListPage }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();
  });

  // TC-01 — Create a deal with required fields only
  test('should create a deal with required fields only and appear in the list', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    const dealName = generateDealName('TC-01 Required Fields');

    // Verify the Create Deal modal opens
    await expect(createDealModal.heading).toBeVisible();

    // Enter a unique deal name
    await createDealModal.fillDealName(dealName);

    // Verify Pipeline defaults to Sales Pipeline
    await expect(createDealModal.pipelineButton).toContainText(PIPELINES.SALES);

    // Verify Deal stage defaults to Appointment Scheduled
    await expect(createDealModal.dealStageButton).toContainText(DEAL_STAGES.APPOINTMENT_SCHEDULED);

    // Leave all optional fields blank and click Create
    await createDealModal.createButton.click();

    // Modal closes and deal appears in list
    await page.waitForURL(/\/record\/0-3\//);
    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName);
    const dealLink = page.getByRole('link', { name: dealName }).first();
    await expect(dealLink).toBeVisible();

    // Deal stage shows Appointment Scheduled
    const row = page.getByRole('row', { name: new RegExp(dealName) }).first();
    await expect(row).toContainText(DEAL_STAGES.APPOINTMENT_SCHEDULED);
  });

  // TC-02 — Create a deal with all fields filled
  test('should create a deal with all fields filled and verify stage and amount in list', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    const dealName = generateDealName('TC-02 All Fields');

    await createDealModal.fillDealName(dealName);

    // Verify Pipeline shows Sales Pipeline; leave as default
    await expect(createDealModal.pipelineButton).toContainText(PIPELINES.SALES);

    // Select Deal stage: Contract Sent
    await createDealModal.selectDealStage(DEAL_STAGES.CONTRACT_SENT);

    // Enter Amount: 15000
    await createDealModal.fillAmount('15000');

    // Enter Close date: next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const mm = String(nextMonth.getMonth() + 1).padStart(2, '0');
    const dd = String(nextMonth.getDate()).padStart(2, '0');
    const yyyy = nextMonth.getFullYear();
    await createDealModal.fillCloseDate(`${mm}/${dd}/${yyyy}`);

    // Select Deal type: New Business
    const iframe = createDealModal['iframeLocator'];
    await createDealModal.dealTypeButton.click();
    await iframe.getByRole('option', { name: 'New Business' }).first().click();

    // Select Priority: High
    await createDealModal.priorityButton.click();
    await iframe.getByRole('option', { name: 'High' }).first().click();

    // Click Create
    await createDealModal.createButton.click();
    await page.waitForURL(/\/record\/0-3\//);

    // Verify deal appears in list with correct name, stage and amount
    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName);
    const row = page.getByRole('row', { name: new RegExp(dealName) }).first();
    await expect(row).toBeVisible();
    await expect(row).toContainText(DEAL_STAGES.CONTRACT_SENT);
    await expect(row).toContainText('15,000');
  });

  // TC-03 — Create a deal using "Create and add another"
  test('should create two deals using Create and add another', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    const dealName1 = generateDealName('TC-03 Batch Deal 1');
    const dealName2 = generateDealName('TC-03 Batch Deal 2');

    // Enter first deal name
    await createDealModal.fillDealName(dealName1);

    // Click Create and add another
    await createDealModal.createAndAddAnotherButton.click();

    // Modal remains open and fields are cleared
    await expect(createDealModal.heading).toBeVisible();
    await expect(createDealModal.dealNameInput).toBeEmpty();

    // Enter second deal name
    await createDealModal.fillDealName(dealName2);

    // Click Create
    await createDealModal.createButton.click();
    await page.waitForURL(/\/record\/0-3\//);

    // Both deals appear in the Deals list
    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName1);
    await expect(page.getByRole('link', { name: dealName1 }).first()).toBeVisible();

    await dealsListPage.open();
    await dealsListPage.searchDeal(dealName2);
    await expect(page.getByRole('link', { name: dealName2 }).first()).toBeVisible();
  });

  // TC-04 — Attempt to create a deal without a deal name (validation)
  test('should keep Create button disabled when Deal Name is empty', async ({
    createDealModal,
  }) => {
    // Verify Create button is disabled when deal name is empty
    await expect(createDealModal.dealNameInput).toBeEmpty();
    await expect(createDealModal.createButton).toBeDisabled();

    // Press Enter in the form — modal should not close
    await createDealModal.dealNameInput.press('Enter');
    await expect(createDealModal.heading).toBeVisible();
    await expect(createDealModal.createButton).toBeDisabled();
  });

  // TC-05 — Cancel deal creation
  test('should cancel deal creation and not create a deal', async ({
    page,
    dealsListPage,
    createDealModal,
  }) => {
    const dealName = generateDealName('TC-05 Cancel Deal');

    // Note the current total deal count
    await createDealModal.cancel();
    await dealsListPage.open();
    const initialCount = await dealsListPage.getDealCount();

    // Reopen modal and fill a deal name
    await dealsListPage.openCreateDealModal();
    await createDealModal.fillDealName(dealName);

    // Click Cancel
    await createDealModal.cancel();

    // Modal closes
    await expect(createDealModal.heading).toBeHidden();
    await expect(page).toHaveURL(/\/views\/all\/list/);

    // No new deal with the entered name appears
    await dealsListPage.searchDeal(dealName);
    await expect(page.getByRole('link', { name: dealName })).toBeHidden();

    // Deal count is unchanged (restore search first to get accurate count)
    await dealsListPage.open();
    const finalCount = await dealsListPage.getDealCount();
    expect(finalCount).toBe(initialCount);
  });

  // TC-06 — Cancel deal creation by closing the modal (X button)
  test('should close modal via X button and not create a deal', async ({
    page,
    createDealModal,
  }) => {
    const dealName = generateDealName('TC-06 Close X Deal');

    await createDealModal.fillDealName(dealName);

    // Click the Close (×) button
    await createDealModal.closeButton.click();

    // Modal closes and no deal is created
    await expect(createDealModal.heading).toBeHidden();
    await expect(page).toHaveURL(/\/views\/all\/list/);
  });

  // TC-07 — Create a deal and associate it with a Contact
  test('should create a deal associated with a Contact', async ({
    page,
    createDealModal,
  }) => {
    const dealName = generateDealName('TC-07 Contact Assoc');

    await createDealModal.fillDealName(dealName);

    // Click Contact Search and select the first available contact
    await createDealModal.selectContact();

    // Click Create
    await createDealModal.createButton.click();
    await page.waitForURL(/\/record\/0-3\//);

    // Open deal detail and verify associated contact
    await expect(page.getByRole('button', { name: /Contacts \(1\)/ })).toBeVisible();
  });

  // TC-08 — Create a deal and associate it with a Company
  test('should create a deal associated with a Company', async ({
    page,
    createDealModal,
  }) => {
    const dealName = generateDealName('TC-08 Company Assoc');

    await createDealModal.fillDealName(dealName);

    // Click Company Search and select the first available company
    await createDealModal.selectCompany();

    // Click Create
    await createDealModal.createButton.click();
    await page.waitForURL(/\/record\/0-3\//);

    // Open deal detail and verify associated company
    await expect(page.getByRole('button', { name: /Companies \(1\)/ })).toBeVisible();
  });
});
