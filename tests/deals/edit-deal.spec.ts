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

  test('should display deal detail page with correct initial stage', async ({ page }) => {
    await page.goto(dealUrl);

    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Appointment Scheduled/ })).toBeVisible();
  });

  test('should allow editing the deal name inline from the detail page', async ({
    page,
    dealDetailPage,
  }) => {
    await page.goto(dealUrl);

    const newName = generateDealName('Renamed Deal');

    await dealDetailPage.editNameButton.click();
    const nameInput = page.getByRole('textbox', { name: 'Deal Name' });
    await nameInput.fill(newName);
    await nameInput.press('Enter');

    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(newName);
  });

  test('should change the deal stage from the deal detail page', async ({
    page,
    dealDetailPage,
  }) => {
    await page.goto(dealUrl);

    await dealDetailPage.changeDealStage(DEAL_STAGES.QUALIFIED_TO_BUY);

    await expect(
      page.getByRole('button', { name: DEAL_STAGES.QUALIFIED_TO_BUY }),
    ).toBeVisible();
  });

  test('should change the deal stage to Closed Won from the detail page', async ({
    page,
    dealDetailPage,
  }) => {
    await page.goto(dealUrl);

    await dealDetailPage.changeDealStage(DEAL_STAGES.CLOSED_WON);

    await expect(
      page.getByRole('button', { name: DEAL_STAGES.CLOSED_WON }),
    ).toBeVisible();
  });

  test('should change the deal stage to Closed Lost from the detail page', async ({
    page,
    dealDetailPage,
  }) => {
    await page.goto(dealUrl);

    await dealDetailPage.changeDealStage(DEAL_STAGES.CLOSED_LOST);

    await expect(
      page.getByRole('button', { name: DEAL_STAGES.CLOSED_LOST }),
    ).toBeVisible();
  });

  test('should update close date from deal detail page header', async ({ page }) => {
    await page.goto(dealUrl);

    // Close date field in the header is an editable textbox
    const closeDateField = page.getByRole('textbox', { name: '--' }).first();
    await closeDateField.fill('06/30/2026');
    await closeDateField.press('Enter');

    // Wait for save confirmation toast
    await expect(page.getByText('"Close Date" changes saved').first()).toBeVisible();
  });

  test('should change deal stage inline from the deals list', async ({
    page,
    dealsListPage,
  }) => {
    await dealsListPage.open();

    const stageCell = page
      .getByRole('row', { name: /Edit Test Setup/ })
      .last()
      .getByRole('button', { name: DEAL_STAGES.APPOINTMENT_SCHEDULED });

    await stageCell.click();

    const stageOption = page.getByRole('option', { name: DEAL_STAGES.QUALIFIED_TO_BUY }).first();
    await expect(stageOption).toBeVisible();
    await stageOption.click();
  });

  test('should display About this deal section with properties on detail page', async ({
    page,
  }) => {
    await page.goto(dealUrl);

    await expect(page.getByRole('button', { name: 'About this deal' })).toBeVisible();
    await expect(page.getByText('Deal Type')).toBeVisible();
    await expect(page.getByText('Priority')).toBeVisible();
    await expect(page.getByText('Deal owner')).toBeVisible();
  });
});
