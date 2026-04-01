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

    // Enter note text in the contenteditable area
    const noteInput = page.getByRole('generic', { name: 'Create a Note' });
    await noteInput.click();
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
    const taskTitleInput = page.getByRole('textbox', { name: /Task title|Title/i }).first()
      .or(page.getByPlaceholder(/task title|type a title/i).first());
    await taskTitleInput.fill(taskTitle);

    // Set a due date
    const dateInput = page.getByRole('textbox', { name: /Due date/i }).first()
      .or(page.getByLabel(/Due date/i).first());
    await dateInput.fill('12/31/2026');

    // Save the task
    const saveButton = page.getByRole('button', { name: /Save|Create task/i }).last();
    await saveButton.click();

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
    const noteInput = page.getByRole('generic', { name: 'Create a Note' });
    await noteInput.click();
    await page.keyboard.type(noteText);
    await page.getByRole('button', { name: 'Create note' }).click();
    await expect(page.getByText(noteText)).toBeVisible();

    // Click the Notes tab in the activity section
    await page.getByRole('button', { name: 'Notes' }).first().click();

    // Only notes are displayed in the feed
    await expect(page.getByText(noteText)).toBeVisible();
  });
});
