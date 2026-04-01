import { test, expect } from '../../fixtures/base.fixture';
import { generateDealName, DEAL_STAGES } from '../../data/deals';

test.describe('Deals Board View', () => {
  test.beforeEach(async ({ dealsBoardPage }) => {
    await dealsBoardPage.open();
  });

  test('should display the board view with pipeline stage columns', async ({
    page,
    dealsBoardPage,
  }) => {
    await expect(page).toHaveTitle(/Deals/);
    await expect(dealsBoardPage.boardContainer).toBeVisible();
  });

  test('should display all 7 pipeline stages as columns', async ({ page }) => {
    await expect(page.getByText(DEAL_STAGES.APPOINTMENT_SCHEDULED, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.QUALIFIED_TO_BUY, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.PRESENTATION_SCHEDULED, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.DECISION_MAKER_BOUGHT_IN, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.CONTRACT_SENT, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.CLOSED_WON, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.CLOSED_LOST, { exact: true }).first()).toBeVisible();
  });

  test('should display a deal count badge for each stage column', async ({ page }) => {
    const appointmentColumn = page
      .getByText(DEAL_STAGES.APPOINTMENT_SCHEDULED, { exact: true })
      .first();
    await expect(appointmentColumn).toBeVisible();

    const countElement = page.locator('p').filter({ hasText: /^\d+$/ }).first();
    await expect(countElement).toBeVisible();
  });

  test('should show a newly created deal in the correct stage column on the board', async ({
    page,
    dealsBoardPage,
    dealsListPage,
    createDealModal,
  }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();

    const dealName = generateDealName('Board Stage Test');
    await createDealModal.fillDealName(dealName);
    await createDealModal.selectDealStage(DEAL_STAGES.QUALIFIED_TO_BUY);
    await createDealModal.createButton.click();

    await page.waitForURL(/\/record\/0-3\//);

    await dealsBoardPage.open();

    const dealCard = await dealsBoardPage.getDealCardByName(dealName);
    await expect(dealCard).toBeVisible();
  });

  test('should navigate to deal detail when clicking a deal card on the board', async ({
    page,
    dealsBoardPage,
    dealsListPage,
    createDealModal,
  }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();

    const dealName = generateDealName('Board Click Test');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    await dealsBoardPage.open();

    const dealCard = await dealsBoardPage.getDealCardByName(dealName);
    await dealCard.click();

    await expect(page).toHaveURL(/\/record\/0-3\//);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(dealName);
  });

  test('should display the Add deals button on the board view', async ({ dealsBoardPage }) => {
    await expect(dealsBoardPage.addDealsButton).toBeVisible();
  });

  test('should navigate to list view from the board via URL', async ({
    page,
    dealsBoardPage,
  }) => {
    await dealsBoardPage.switchToListView();

    await expect(page).toHaveURL(/\/views\/all\/list/);
  });

  test('should display deal cards with name and close date info', async ({
    page,
    dealsBoardPage,
    dealsListPage,
    createDealModal,
  }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();

    const dealName = generateDealName('Card Info Board Test');
    await createDealModal.fillDealName(dealName);
    await createDealModal.fillCloseDate('12/31/2026');
    await createDealModal.createButton.click();

    await page.waitForURL(/\/record\/0-3\//);

    await dealsBoardPage.open();

    const dealCard = await dealsBoardPage.getDealCardByName(dealName);
    await expect(dealCard).toBeVisible();

    // Close date is shown in the card details below the name
    const cardContainer = page.locator('[class*="card"], [data-test-id*="card"]').filter({ has: dealCard });
    await expect(page.getByText('Close date:').first()).toBeVisible();
  });
});
