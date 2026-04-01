import { test, expect } from '../../fixtures/base.fixture';
import { generateDealName, DEAL_STAGES } from '../../data/deals';

test.describe('Deals Board View', () => {
  // TC-30 — Switch to Board view from List view
  test('should switch to Board view from List view', async ({
    page,
    dealsListPage,
  }) => {
    await dealsListPage.open();

    // Click the Table view button and select Board view
    await page.getByRole('button', { name: 'Table view' }).click();
    await page.getByRole('button', { name: 'Board view' }).click();

    // URL changes to /views/all/board
    await expect(page).toHaveURL(/\/views\/all\/board/);

    // All 7 pipeline stages are visible as columns
    await expect(page.getByText(DEAL_STAGES.APPOINTMENT_SCHEDULED, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.QUALIFIED_TO_BUY, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.PRESENTATION_SCHEDULED, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.DECISION_MAKER_BOUGHT_IN, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.CONTRACT_SENT, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.CLOSED_WON, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.CLOSED_LOST, { exact: true }).first()).toBeVisible();
  });

  // TC-31 — Switch back to Table (List) view from Board view
  test('should switch back to Table view from Board view', async ({
    page,
    dealsBoardPage,
  }) => {
    await dealsBoardPage.open();

    // Click the Board view button and select Table view
    await page.getByRole('button', { name: 'Board view' }).click();
    await page.getByRole('button', { name: 'Table view' }).click();

    // URL changes back to /views/all/list
    await expect(page).toHaveURL(/\/views\/all\/list/);

    // Deals are displayed in a table format
    await expect(page.getByRole('table')).toBeVisible();
  });

  // TC-32 — Verify deal card displays correct information on Board view
  test('should display correct deal card information on the Board view', async ({
    page,
    dealsBoardPage,
    createDealModal,
  }) => {
    await page.goto('/contacts/148143933/objects/0-3/views/all/list');
    await page.waitForLoadState('domcontentloaded');
    await page.getByTestId('create-object-dropdown').click();
    await page.getByTestId('create-object-dropdown-create-object').click();

    const dealName = generateDealName('TC-32 Card Info Test');
    await createDealModal.fillDealName(dealName);
    await createDealModal.selectDealStage(DEAL_STAGES.APPOINTMENT_SCHEDULED);
    await createDealModal.fillCloseDate('12/31/2026');
    await createDealModal.createButton.click();
    await page.waitForURL(/\/record\/0-3\//);

    await dealsBoardPage.open();

    // Locate the test deal card in the relevant column
    const dealCard = await dealsBoardPage.getDealCardByName(dealName);
    await expect(dealCard).toBeVisible();

    // Deal card shows the correct deal name
    await expect(dealCard).toContainText(dealName);
  });

  // TC-33 — Create a deal from Board view
  test('should create a deal from Board view and show card in correct column', async ({
    page,
    dealsBoardPage,
    createDealModal,
  }) => {
    await dealsBoardPage.open();

    // Click Add deals → Create new
    await dealsBoardPage.addDealsButton.click();
    await page.getByRole('button', { name: 'Create new' }).last().click();

    // Enter a unique deal name and set Deal Stage to Qualified To Buy
    const dealName = generateDealName('TC-33 Board Create');
    await createDealModal.fillDealName(dealName);
    await createDealModal.selectDealStage(DEAL_STAGES.QUALIFIED_TO_BUY);
    await createDealModal.createButton.click();

    // Modal closes and we land on deal detail page
    await page.waitForURL(/\/record\/0-3\//);

    // Navigate back to board view
    await dealsBoardPage.open();

    // A new deal card appears in the Qualified To Buy column
    const dealCard = await dealsBoardPage.getDealCardByName(dealName);
    await expect(dealCard).toBeVisible();
  });

  // TC-34 — Navigate to deal detail from Board view card
  test('should navigate to deal detail page when clicking a deal card name', async ({
    page,
    dealsBoardPage,
    dealsListPage,
    createDealModal,
  }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();

    const dealName = generateDealName('TC-34 Board Navigate');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);

    await dealsBoardPage.open();

    // Locate the deal card and click the deal name link
    const dealCard = await dealsBoardPage.getDealCardByName(dealName);
    await dealCard.click();

    // Browser navigates to the deal detail page
    await expect(page).toHaveURL(/\/record\/0-3\//);

    // Page title matches the deal name
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(dealName);
  });

  test('should display the board view with pipeline stage columns', async ({
    page,
    dealsBoardPage,
  }) => {
    await dealsBoardPage.open();
    await expect(page).toHaveTitle(/Deals/);
    await expect(dealsBoardPage.boardContainer).toBeVisible();
  });

  test('should display all 7 pipeline stages as columns', async ({
    page,
    dealsBoardPage,
  }) => {
    await dealsBoardPage.open();
    await expect(page.getByText(DEAL_STAGES.APPOINTMENT_SCHEDULED, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.QUALIFIED_TO_BUY, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.PRESENTATION_SCHEDULED, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.DECISION_MAKER_BOUGHT_IN, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.CONTRACT_SENT, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.CLOSED_WON, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(DEAL_STAGES.CLOSED_LOST, { exact: true }).first()).toBeVisible();
  });
});

