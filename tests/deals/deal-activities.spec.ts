import { test, expect } from '../../fixtures/base.fixture';
import { generateDealName } from '../../data/deals';

test.describe('Deal Detail Page — Activities', () => {
  let dealUrl: string;

  test.beforeEach(async ({ page, dealsListPage, createDealModal }) => {
    await dealsListPage.open();
    await dealsListPage.openCreateDealModal();

    const dealName = generateDealName('Activities Test Setup');
    await createDealModal.create({ name: dealName });
    await page.waitForURL(/\/record\/0-3\//);
    dealUrl = page.url();
  });

  // TC-35 — Add a note to a deal
  test('should add a note to a deal and see it in the activity feed', async ({
    page,
    dealDetailPage,
  }) => {
    await page.goto(dealUrl);

    const noteText = `Test note ${Date.now()}`;

    // Click Create a note in the activity actions bar
    await dealDetailPage.createNoteButton.click();

    // Enter note text in the contenteditable area (auto-focused after clicking Note button)
    const noteEditor = page.locator('[contenteditable="true"]').last();
    await noteEditor.waitFor();
    await noteEditor.click();
    await page.keyboard.type(noteText);

    // Save/submit the note
    await page.getByRole('button', { name: 'Create note' }).click();

    // The note appears in the activity feed
    await expect(page.getByText(noteText)).toBeVisible();
  });

  // TC-36 — Create a task linked to a deal
  test('should create a task linked to the deal and see it in the activity timeline', async ({
    page,
    dealDetailPage,
  }) => {
    await page.goto(dealUrl);

    const taskTitle = `Follow up ${Date.now()}`;

    // Click Create a task in the activity actions bar
    await dealDetailPage.createTaskButton.click();

    // Enter a task title
    const taskTitleInput = page.getByRole('textbox', { name: 'Enter your task' });
    await taskTitleInput.fill(taskTitle);

    // Save the task (activity date defaults to 3 business days)
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    // The task appears in the activity timeline
    await expect(page.getByText(taskTitle)).toBeVisible();
  });

  // TC-37 — Filter activity feed by type (Notes)
  test('should filter activity feed to show only notes', async ({
    page,
    dealDetailPage,
  }) => {
    await page.goto(dealUrl);

    // First create a note so there's content to filter
    const noteText = `Filter Note ${Date.now()}`;
    await dealDetailPage.createNoteButton.click();
    const noteEditor = page.locator('[contenteditable="true"]').last();
    await noteEditor.waitFor();
    await noteEditor.click();
    await page.keyboard.type(noteText);
    await page.getByRole('button', { name: 'Create note' }).click();
    await expect(page.getByText(noteText)).toBeVisible();

    // Click the Notes tab in the activity section
    await page.getByRole('button', { name: 'Notes' }).first().click();

    // Only notes are displayed in the feed
    await expect(page.getByText(noteText)).toBeVisible();
  });
});
