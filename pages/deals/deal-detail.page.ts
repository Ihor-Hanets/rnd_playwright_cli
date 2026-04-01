import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class DealDetailPage extends BasePage {
  readonly dealNameHeading: Locator;
  readonly editNameButton: Locator;
  readonly actionsButton: Locator;
  readonly dealNameInput: Locator;
  readonly pipelineButton: Locator;
  readonly dealStageButton: Locator;
  readonly closeDateInput: Locator;
  readonly amountDisplay: Locator;
  readonly deleteButton: Locator;
  readonly cloneButton: Locator;
  readonly mergeButton: Locator;
  readonly dealsBackLink: Locator;
  readonly createNoteButton: Locator;
  readonly createTaskButton: Locator;
  readonly scheduleMeetingButton: Locator;
  readonly activitiesList: Locator;
  readonly associatedContactsSection: Locator;
  readonly associatedCompaniesSection: Locator;
  readonly aboutThisDealSection: Locator;

  constructor(page: Page) {
    super(page);
    this.dealNameHeading = page.getByRole('heading', { level: 2 }).first();
    this.editNameButton = page.getByRole('button', { name: 'Edit' }).first();
    this.actionsButton = page
      .getByTestId('record-highlight-main-content')
      .getByRole('button', { name: 'Actions' });
    this.dealNameInput = page.getByRole('textbox', { name: 'Deal Name' });
    this.pipelineButton = page.getByRole('button', { name: /Sales Pipeline/ });
    this.dealStageButton = page.getByRole('button', { name: /Appointment Scheduled|Qualified To Buy|Presentation Scheduled|Decision Maker Bought-In|Contract Sent|Closed Won|Closed Lost/ }).first();
    this.closeDateInput = page.getByRole('textbox', { name: '--' }).first();
    this.amountDisplay = page.getByText('Amount:').locator('..').getByRole('generic').last();
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.cloneButton = page.getByRole('button', { name: 'Clone' });
    this.mergeButton = page.getByRole('button', { name: 'Merge' });
    this.dealsBackLink = page.getByRole('link', { name: 'Deals' });
    this.createNoteButton = page.getByRole('button', { name: 'Create a note' });
    this.createTaskButton = page.getByRole('button', { name: 'Create a task' });
    this.scheduleMeetingButton = page.getByRole('button', { name: 'Schedule a meeting' });
    this.activitiesList = page.getByRole('list', { name: 'Activities' });
    this.associatedContactsSection = page.getByRole('button', { name: /Contacts \(/ });
    this.associatedCompaniesSection = page.getByRole('button', { name: /Companies \(/ });
    this.aboutThisDealSection = page.getByRole('button', { name: 'About this deal' });
  }

  async open(): Promise<void> {
    throw new Error('Use navigate(url) to open a specific deal. This page requires a deal URL.');
  }

  async openActions(): Promise<void> {
    await this.actionsButton.click();
  }

  async deleteDeal(): Promise<void> {
    await this.openActions();
    await this.deleteButton.click();

    const confirmButton = this.page.getByRole('button', { name: 'Delete' }).last();
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
  }

  async editDealName(newName: string): Promise<void> {
    await this.editNameButton.click();
    const nameInput = this.page.getByRole('textbox', { name: 'Deal Name' });
    await nameInput.fill(newName);
    await nameInput.press('Enter');
  }

  async changeDealStage(stage: string): Promise<void> {
    await this.dealStageButton.click();
    await this.page.getByRole('option', { name: stage }).first().click();
  }

  async getDealName(): Promise<string> {
    return this.dealNameHeading.innerText();
  }

  async getDealStage(): Promise<string> {
    return this.dealStageButton.innerText();
  }
}
