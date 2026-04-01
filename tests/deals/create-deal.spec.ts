import { test, expect } from '../../fixtures/base.fixture';
import { generateDealName, DEAL_STAGES } from '../../data/deals';

test.describe('Create Deal', () => {
  test.beforeEach(async ({ dealsListPage }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();
  });

  test('should display the Create Deal modal with required fields', async ({ createDealModal }) => {
    await expect(createDealModal.heading).toBeVisible();
    await expect(createDealModal.dealNameInput).toBeVisible();
    await expect(createDealModal.pipelineButton).toBeVisible();
    await expect(createDealModal.dealStageButton).toBeVisible();
    await expect(createDealModal.createButton).toBeVisible();
    await expect(createDealModal.cancelButton).toBeVisible();
  });

  test('should keep Create button disabled when Deal Name is empty', async ({ createDealModal }) => {
    await expect(createDealModal.dealNameInput).toBeEmpty();
    await expect(createDealModal.createButton).toBeDisabled();
  });

  test('should enable Create button after entering Deal Name', async ({ createDealModal }) => {
    await createDealModal.fillDealName(generateDealName('Enable Button Test'));
    await expect(createDealModal.createButton).toBeEnabled();
  });

  test('should create a deal with only the required Deal Name field', async ({
    page,
    createDealModal,
  }) => {
    const dealName = generateDealName('Required Fields Only');

    await createDealModal.create({ name: dealName });

    await expect(page).toHaveURL(/\/record\/0-3\//);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(dealName);
  });

  test('should create a deal with all optional fields filled', async ({
    page,
    createDealModal,
  }) => {
    const dealName = generateDealName('Full Fields Deal');

    await createDealModal.fillDealName(dealName);
    await createDealModal.selectDealStage(DEAL_STAGES.QUALIFIED_TO_BUY);
    await createDealModal.fillAmount('5000');
    await createDealModal.fillCloseDate('12/31/2026');

    await createDealModal.createButton.click();

    await expect(page).toHaveURL(/\/record\/0-3\//);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(dealName);
  });

  test('should display all deal stages in the stage dropdown', async ({ createDealModal }) => {
    await createDealModal.dealStageButton.click();

    const iframe = createDealModal['iframeLocator'];
    await expect(iframe.getByRole('option', { name: DEAL_STAGES.APPOINTMENT_SCHEDULED }).first()).toBeVisible();
    await expect(iframe.getByRole('option', { name: DEAL_STAGES.QUALIFIED_TO_BUY }).first()).toBeVisible();
    await expect(iframe.getByRole('option', { name: DEAL_STAGES.PRESENTATION_SCHEDULED }).first()).toBeVisible();
    await expect(iframe.getByRole('option', { name: DEAL_STAGES.DECISION_MAKER_BOUGHT_IN }).first()).toBeVisible();
    await expect(iframe.getByRole('option', { name: DEAL_STAGES.CONTRACT_SENT }).first()).toBeVisible();
    await expect(iframe.getByRole('option', { name: DEAL_STAGES.CLOSED_WON }).first()).toBeVisible();
    await expect(iframe.getByRole('option', { name: DEAL_STAGES.CLOSED_LOST }).first()).toBeVisible();
  });

  test('should close the Create Deal modal when Cancel is clicked', async ({
    page,
    createDealModal,
  }) => {
    await createDealModal.cancel();

    await expect(createDealModal.heading).toBeHidden();
    await expect(page).toHaveURL(/\/views\/all\/list/);
  });

  test('should create a deal and stay on modal when using Create and add another', async ({
    createDealModal,
  }) => {
    const dealName = generateDealName('Create And Add Another');

    await createDealModal.createAndAddAnother({ name: dealName });

    await expect(createDealModal.heading).toBeVisible();
    await expect(createDealModal.dealNameInput).toBeEmpty();
  });

  test('should default the pipeline to Sales Pipeline', async ({ createDealModal }) => {
    await expect(createDealModal.pipelineButton).toContainText('Sales Pipeline');
  });

  test('should default the deal stage to Appointment Scheduled', async ({ createDealModal }) => {
    await expect(createDealModal.dealStageButton).toContainText(DEAL_STAGES.APPOINTMENT_SCHEDULED);
  });
});
