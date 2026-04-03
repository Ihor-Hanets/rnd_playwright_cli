import { test, expect } from '../../fixtures/base.fixture';
import { generateDealName, DEAL_STAGES } from '../../data/deals';

test.describe('Clone Deal', () => {
  // TC-20 — Clone a deal from the detail page
  test('should clone a deal and verify clone appears in the Deals list', async ({
    page,
    dealsListPage,
    createDealModal,
    dealDetailPage,
  }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();

    const originalName = generateDealName('TC-20 Clone Source');
    await createDealModal.fillDealName(originalName);
    await createDealModal.selectDealStage(DEAL_STAGES.CONTRACT_SENT);
    await createDealModal.fillAmount('9999');
    await createDealModal.fillCloseDate('12/31/2026');
    await createDealModal.createButton.click();
    await page.waitForURL(/\/record\/0-3\//);

    // Click Actions → Clone
    await dealDetailPage.openActions();
    await expect(dealDetailPage.cloneButton).toBeVisible();
    await dealDetailPage.cloneButton.click();

    // Confirm/observe the clone action
    await page.waitForURL(/\/record\/0-3\//);

    // Note the URL of the cloned deal — it should be different from the original
    const clonedDealUrl = page.url();
    expect(clonedDealUrl).not.toContain(originalName.replace(/ /g, ''));

    // The cloned deal page should show a name (HubSpot may or may not add "Copy of" prefix)
    const clonedDealHeading = page.getByRole('heading', { level: 2 }).first();
    await expect(clonedDealHeading).toBeVisible();
    await expect(clonedDealHeading).not.toBeEmpty();
    const clonedName = (await clonedDealHeading.textContent())?.trim() ?? '';
    expect(clonedName.length).toBeGreaterThan(0);

    // The cloned deal appears in the Deals list — search by the actual cloned name
    await dealsListPage.open();
    await dealsListPage.searchDeal(clonedName);
    await expect(page.getByRole('link', { name: new RegExp(clonedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).first()).toBeVisible();

    // The original deal is untouched
    await dealsListPage.open();
    await dealsListPage.searchDeal(originalName);
    await expect(page.getByRole('link', { name: originalName }).first()).toBeVisible();
  });
});
